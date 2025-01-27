import { fetchApplication } from "@appsmith/actions/applicationActions";
import { setAppMode, updateAppStore } from "actions/pageActions";
import type { ApplicationPayload } from "@appsmith/constants/ReduxActionConstants";
import {
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "@appsmith/constants/ReduxActionConstants";
import { getPersistentAppStore } from "constants/AppConstants";
import type { APP_MODE } from "entities/App";
import log from "loglevel";
import { call, put, select, take, spawn } from "redux-saga/effects";
import { failFastApiCalls } from "sagas/InitSagas";
import { getDefaultPageId } from "sagas/selectors";
import { getCurrentApplication } from "@appsmith/selectors/applicationSelectors";
import history from "utils/history";
import type URLRedirect from "entities/URLRedirect/index";
import URLGeneratorFactory from "entities/URLRedirect/factory";
import { updateBranchLocally } from "actions/gitSyncActions";
import { getCurrentGitBranch } from "selectors/gitSyncSelectors";
import { POST_MESSAGE_TYPE } from "@appsmith/constants/ApiConstants";
import type { TriggerMeta } from "ce/sagas/ActionExecution/ActionExecutionSagas";
import uniqueId from "lodash/uniqueId";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { Channel } from "redux-saga";
import { channel } from "redux-saga";
import type { StoreValueActionDescription } from "@appsmith/entities/DataTree/actionTriggers";
import { handleStoreOperations } from "sagas/ActionExecution/StoreActionSaga";
import { evalWorker } from "sagas/EvaluationsSaga";

export type AppEnginePayload = {
  applicationId?: string;
  pageId?: string;
  branch?: string;
  mode: APP_MODE;
};

export interface IAppEngine {
  setupEngine(payload: AppEnginePayload): any;
  loadAppData(payload: AppEnginePayload): any;
  loadAppURL(pageId: string, pageIdInUrl?: string): any;
  loadAppEntities(toLoadPageId: string, applicationId: string): any;
  loadGit(applicationId: string): any;
  completeChore(): any;
}

export class AppEngineApiError extends Error {}
export class PageNotFoundError extends AppEngineApiError {}
export class ActionsNotFoundError extends AppEngineApiError {}
export class PluginsNotFoundError extends AppEngineApiError {}
export class PluginFormConfigsNotFoundError extends AppEngineApiError {}
interface MessageChannelPayload {
  callbackData: any;
  eventType: EventType;
  triggerMeta: TriggerMeta;
}

export default abstract class AppEngine {
  private _mode: APP_MODE;
  constructor(mode: APP_MODE) {
    this._mode = mode;
    this._urlRedirect = null;
  }
  private _urlRedirect: URLRedirect | null;

  abstract loadAppEntities(toLoadPageId: string, applicationId: string): any;
  abstract loadGit(applicationId: string): any;
  abstract startPerformanceTracking(): any;
  abstract stopPerformanceTracking(): any;
  abstract completeChore(): any;

  *loadAppData(payload: AppEnginePayload) {
    const { applicationId, branch, pageId } = payload;
    const apiCalls: boolean = yield failFastApiCalls(
      [fetchApplication({ applicationId, pageId, mode: this._mode })],
      [
        ReduxActionTypes.FETCH_APPLICATION_SUCCESS,
        ReduxActionTypes.FETCH_PAGE_LIST_SUCCESS,
      ],
      [
        ReduxActionErrorTypes.FETCH_APPLICATION_ERROR,
        ReduxActionErrorTypes.FETCH_PAGE_LIST_ERROR,
      ],
    );
    if (!apiCalls)
      throw new PageNotFoundError(`Cannot find page with id: ${pageId}`);
    const application: ApplicationPayload = yield select(getCurrentApplication);
    const currentGitBranch: ReturnType<typeof getCurrentGitBranch> =
      yield select(getCurrentGitBranch);
    yield put(
      updateAppStore(
        getPersistentAppStore(application.id, branch || currentGitBranch),
      ),
    );
    const toLoadPageId: string = pageId || (yield select(getDefaultPageId));
    this._urlRedirect = URLGeneratorFactory.create(
      application.applicationVersion,
      this._mode,
    );

    // postmessage handler
    const messageChannel = channel<MessageChannelPayload>();
    yield spawn(messageChannelHandler, messageChannel);
    const isJsonString = function (str: string) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    };
    const messageHandler = (event: MessageEvent) => {
      if (event.currentTarget !== window) return;
      if (event.type !== "message") return;
      if (!isValidDomain(event.origin)) return;
      if (!isJsonString(event.data)) return;
      messageChannel.put({
        callbackData: event.data,
        eventType: EventType.ON_STORE_VALUE,
        triggerMeta: {
          source: undefined,
          triggerPropertyName: "triggerPropertyName",
        } as TriggerMeta,
      });

      // Post message to service worker
      const messageObj = JSON.parse(event.data);
      if (messageObj) {
        evalWorker.syncRequest(messageObj);
      }
    };

    // function storageListener(event: Event) {
    //   // Post local storage changed to service worker
    //   if (event instanceof StorageEvent && event.newValue) {
    //     const messageObj = JSON.parse(event.newValue);
    //     evalWorker.syncRequest(messageObj);
    //   }
    // }
    // window.addEventListener("MANA_STORAGE", storageListener);

    window.addEventListener("message", messageHandler);

    window.parent.postMessage(
      JSON.stringify({
        type: POST_MESSAGE_TYPE.LOADED,
      }),
      "*",
    );
    return { toLoadPageId, applicationId: application.id };
  }

  *setupEngine(payload: AppEnginePayload): any {
    const { branch } = payload;
    yield put(updateBranchLocally(branch || ""));
    yield put(setAppMode(this._mode));
    yield put({ type: ReduxActionTypes.START_EVALUATION });
  }

  *loadAppURL(pageId: string, pageIdInUrl?: string) {
    try {
      if (!this._urlRedirect) return;
      const newURL: string = yield call(
        this._urlRedirect.generateRedirectURL.bind(this),
        pageId,
        pageIdInUrl,
      );
      if (!newURL) return;
      history.replace(newURL);
    } catch (e) {
      log.error(e);
    }
  }
}

function* messageChannelHandler(channel: Channel<MessageChannelPayload>) {
  try {
    while (true) {
      const payload: MessageChannelPayload = yield take(channel);
      const { callbackData } = payload;
      const data = JSON.parse(callbackData);
      for (const key in data) {
        if (key == "callbackId" && data[key]) {
          window.parent.postMessage(
            JSON.stringify({
              callbackId: data[key],
              type: POST_MESSAGE_TYPE.TOKEN,
            }),
            "*",
          );
        } else {
          yield call(handleStoreOperations, [
            {
              type: "STORE_VALUE",
              payload: {
                key: key,
                persist: true,
                uniqueActionRequestId: uniqueId("store_value_id_"),
                value: data[key],
              },
            } as StoreValueActionDescription,
          ]);
        }
      }
    }
  } finally {
    channel.close();
  }
}

function isValidDomain(domain: string): boolean {
  const regex1 = new RegExp("/(.+?)[.]manabie.com$");
  const regex2 = new RegExp("/(.+?)[.]web.app$");
  const regex3 = new RegExp("/(.+?)[.]manabie.io$");
  const regex4 = new RegExp("/(.+?)[.]manabie.net$");
  if (
    (window.location.origin == "http://localhost" ||
      window.location.origin ==
        "https://appsmith.local-green.manabie.io:31600" ||
      regex3.test(window.location.origin)) &&
    domain.indexOf("localhost") > -1
  ) {
    return true;
  }

  if (
    regex1.test(domain) ||
    regex2.test(domain) ||
    regex3.test(domain) ||
    regex4.test(domain)
  ) {
    return true;
  }
  return false;
}
