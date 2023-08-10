import React from "react";
import type { ComponentProps } from "widgets/BaseComponent";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/webcam/dist/style.css";
import { BaseButton } from "widgets/ButtonWidget/component";
import { Colors } from "constants/Colors";
import { LanguageEnums } from "entities/App";

function FilePickerComponent(props: FilePickerComponentProps) {
  let computedLabel = props.label;
  const DEFAULT_LANGUAGE = LanguageEnums.EN;

  let lang: LanguageEnums =
    (new URLSearchParams(window.location.search).get(
      "lang",
    ) as LanguageEnums) || DEFAULT_LANGUAGE;

  if (!Object.values(LanguageEnums).includes(lang as LanguageEnums)) {
    lang = DEFAULT_LANGUAGE;
  }
  if (props.files && props.files.length) {
    computedLabel =
      lang == LanguageEnums.JA
        ? `${props.files.length} ファイルが選択されました`
        : `${props.files.length} files selected`;
  }

  /**
   * opens modal
   */
  const openModal = () => {
    props.uppy.getPlugin("Dashboard").openModal();
  };

  return (
    <BaseButton
      borderRadius={props.borderRadius}
      boxShadow={props.boxShadow}
      buttonColor={props.buttonColor}
      disabled={props.isDisabled}
      loading={props.isLoading}
      onClick={openModal}
      text={computedLabel}
    />
  );
}
export interface FilePickerComponentProps extends ComponentProps {
  label: string;
  helpText?: string;
  uppy: any;
  isLoading: boolean;
  files?: any[];
  buttonColor: string;
  borderRadius: string;
  boxShadow?: string;
}

FilePickerComponent.defaultProps = {
  backgroundColor: Colors.GREEN,
};

export default FilePickerComponent;
