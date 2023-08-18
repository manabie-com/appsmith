import React from "react";
import type { ActionsPropsType } from "../header/actions";
import type { BannerPropType } from "../header/banner";

import styled from "styled-components";
import { DEFAULT_FILTER } from "../Constants";
import { LanguageEnums } from "entities/App";

export const ChipContainer = styled.div`
  .filter-container {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
  }

  & .filter-text {
    margin: 0;
    padding-left: 10px;
    font-size: 0.875rem;
    font-weight: 400;
    letter-spacing: 0.15px;
    text-transform: none;
    font-family: Roboto, sans-serif;
    line-height: 1.43;
  }

  & .chip-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
    margin-right: 8px;
  }

  & .chip {
    margin: 0px 4px;
    position: relative;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    appearance: none;
    font-family: Roboto, sans-serif;
    font-size: 0.8125rem;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    height: 24px;
    border-radius: 16px;
    transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    cursor: default;
    outline: 0px;
    text-decoration: none;
    padding: 0px;
    vertical-align: middle;
    box-sizing: border-box;
    color: rgba(0, 0, 0, 0.87);
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid rgb(224, 224, 224);
    background-color: transparent;
  }

  & .chip-label {
    padding-left: 8px;
    padding-right: 8px;
  }

  & .chip-delete-icon {
    width: 16px;
    height: 16px;
    fill: #777;
    color: rgba(33, 33, 33, 0.26);
    font-size: 16px;
    cursor: pointer;
    margin: 0px 4px 0px -4px;
  }

  & .clear-button {
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    background-color: transparent;
    outline: 0px;
    border: 0px;
    margin: 0px;
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    appearance: none;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.4px;
    text-transform: capitalize;
    font-family: Roboto, sans-serif;
    line-height: 1.75;
    min-width: 64px;
    padding: 6px 8px;
    transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    color: rgb(33, 150, 243);
    border-radius: 4px;
  }
`;

const defaultFilters = [{ ...DEFAULT_FILTER }];
function TableHeaderChip(props: ActionsPropsType & BannerPropType) {
  const handleRemoveFilter = (id: string) => {
    if (props.filters) {
      props.applyFilter(props.filters.filter((filter) => filter.id != id));
    }
  };
  const handleClearAll = () => {
    props.applyFilter(defaultFilters);
  };
  const DEFAULT_LANGUAGE = LanguageEnums.EN;

  let lang: LanguageEnums =
    (new URLSearchParams(window.location.search).get(
      "lang",
    ) as LanguageEnums) || DEFAULT_LANGUAGE;

  if (!Object.values(LanguageEnums).includes(lang as LanguageEnums)) {
    lang = DEFAULT_LANGUAGE;
  }
  return props.isAddRowInProgress ? null : (
    <ChipContainer>
      <div className="filter-container">
        <p className="filter-text">
          {lang == LanguageEnums.JA
            ? "適応中のフィルター :"
            : "You filter by :"}
        </p>
        <div className="chip-container">
          {props.filters?.map((item, index) => {
            return (
              <div key={index} className="chip">
                <span className="chip-label">
                  {props.columns.find((x) => x.id == item.column)?.Header}
                </span>
                <svg
                  onClick={() => handleRemoveFilter(item.id)}
                  className="chip-delete-icon"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </div>
            );
          })}
        </div>
        <button className="clear-button" onClick={handleClearAll} type="button">
          {lang == LanguageEnums.JA ? "リセット" : " Clear All"}
        </button>
      </div>
    </ChipContainer>
  );
}

export default TableHeaderChip;
