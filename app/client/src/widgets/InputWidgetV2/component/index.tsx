import React from "react";
import type { BaseInputComponentProps } from "widgets/BaseInputWidget/component";
import BaseInputComponent from "widgets/BaseInputWidget/component";
import type { InputTypes } from "widgets/BaseInputWidget/constants";

const getInputHTMLType = (inputType: InputTypes) => {
  switch (inputType) {
    case "NUMBER":
      return "NUMBER";
    case "TEXT":
      return "TEXT";
    case "EMAIL":
      return "EMAIL";
    case "PASSWORD":
      return "PASSWORD";
    case "COLOR":
      return "COLOR";
    default:
      return "TEXT";
  }
};

class InputComponent extends React.Component<InputComponentProps> {
  onTextChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    this.props.onValueChange(event.target.value);
  };

  getIcon(inputType: InputTypes) {
    switch (inputType) {
      case "EMAIL":
        return "envelope";
      default:
        return undefined;
    }
  }

  render() {
    return (
      <BaseInputComponent
        accentColor={this.props.accentColor}
        allowNumericCharactersOnly={this.props.allowNumericCharactersOnly}
        autoFocus={this.props.autoFocus}
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        buttonPosition={this.props.buttonPosition}
        compactMode={this.props.compactMode}
        defaultValue={this.props.defaultValue}
        disableNewLineOnPressEnterKey={this.props.disableNewLineOnPressEnterKey}
        disabled={this.props.disabled}
        errorMessage={this.props.errorMessage}
        fill={this.props.fill}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        muiIcon={this.props.muiIcon}
        iconColor={this.props.iconColor}
        inputHTMLType={getInputHTMLType(this.props.inputType)}
        inputRef={this.props.inputRef}
        inputType={this.props.inputType}
        intent={this.props.intent}
        isDynamicHeightEnabled={this.props.isDynamicHeightEnabled}
        isInvalid={this.props.isInvalid}
        isLoading={this.props.isLoading}
        label={this.props.label}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelWidth={this.props.labelWidth}
        maxChars={this.props.maxChars}
        maxNum={this.props.maxNum}
        minNum={this.props.minNum}
        multiline={this.props.multiline}
        onFocusChange={this.props.onFocusChange}
        onKeyDown={this.props.onKeyDown}
        onValueChange={this.props.onValueChange}
        placeholder={this.props.placeholder}
        showError={this.props.showError}
        spellCheck={this.props.spellCheck}
        stepSize={1}
        tooltip={this.props.tooltip}
        value={this.props.value}
        widgetId={this.props.widgetId}
        errorTextColor={this.props.errorTextColor}
        helpText={this.props.helpText}
        helpTextJP={this.props.helpTextJP}
        helpTextColor={this.props.helpTextColor}
        errorMessageJP={this.props.errorMessageJP}
        labelJP={this.props.labelJP}
        placeholderJP={this.props.placeholderJP}
        tooltipJP={this.props.tooltipJP}
      />
    );
  }
}
export interface InputComponentProps extends BaseInputComponentProps {
  inputType: InputTypes;
  maxChars?: number;
  spellCheck?: boolean;
  maxNum?: number;
  minNum?: number;
  borderRadius?: string;
  boxShadow?: string;
  accentColor?: string;
}

export default InputComponent;
