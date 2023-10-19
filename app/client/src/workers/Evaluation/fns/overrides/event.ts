import ExecutionMetaData from "../utils/ExecutionMetaData";

export function windowMessageListener(callback: (...args: any[]) => void) {
  const metaData = ExecutionMetaData.getExecutionMetaData();

  const _callBack = (message: any) => {
    self["$isDataField"] = false;
    ExecutionMetaData.setExecutionMetaData(metaData);
    typeof callback === "function" && callback(message);
  };

  self.addEventListener("message", (event) => {
    if (
      event.data &&
      event.data.body &&
      event.data.body.method === "MESSAGE_TRIGGER"
    ) {
      _callBack(event.data.body.data);
    }
  });

  return 0;
}
