import type { ReactNode } from "react";
import React from "react";

import type { TextSize } from "constants/WidgetConstants";
import { countOccurrences } from "workers/Evaluation/helpers";

import { ValidationTypes } from "constants/WidgetValidation";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";

import WidgetStyleContainer from "components/designSystems/appsmith/WidgetStyleContainer";
import type { Color } from "constants/Colors";
import type { Stylesheet } from "entities/AppTheming";
import styled from "styled-components";
import type { AppState } from "@appsmith/reducers";
import { connect } from "react-redux";
import { LanguageEnums } from "entities/App";
import { translate } from "utils/translate";
import { pick } from "lodash";
import { AutocompleteDataType } from "utils/autocomplete/CodemirrorTernService";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import type { ContainerStyle } from "widgets/ContainerWidget/component";
import type { TextAlign } from "../component";
import TextComponent from "../component";
import { OverflowTypes } from "../constants";

const MAX_HTML_PARSING_LENGTH = 1000;

const TextContainer = styled(WidgetStyleContainer)`
  overflow: hidden;
`;

interface TextProps extends TextWidgetProps {
  lang: LanguageEnums;
}

class TextWidget extends BaseWidget<TextProps, WidgetState> {
  static defaultProps: Partial<TextProps> | undefined;

  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "General",
        children: [
          {
            propertyName: "text",
            helpText: "Sets the text of the widget",
            label: "Text",
            controlType: "INPUT_TEXT",
            placeholderText: "Name:",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: { limitLineBreaks: true },
            },
          },
          {
            propertyName: "translationJp",
            helpText: "Sets the translation of the widget",
            label: "Translation JP",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter translation for JP",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: { limitLineBreaks: true },
            },
          },
          {
            propertyName: "overflow",
            label: "Overflow Text",
            helpText: "Controls the text behavior when length of text exceeds",
            controlType: "ICON_TABS",
            fullWidth: true,
            options: [
              {
                label: "Scroll",
                value: OverflowTypes.SCROLL,
              },
              {
                label: "Truncate",
                value: OverflowTypes.TRUNCATE,
              },
              {
                label: "None",
                value: OverflowTypes.NONE,
              },
            ],
            defaultValue: OverflowTypes.NONE,
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            propertyName: "isVisible",
            helpText: "Controls the visibility of the widget",
            label: "Visible",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "animateLoading",
            label: "Animate Loading",
            controlType: "SWITCH",
            helpText: "Controls the loading of the widget",
            defaultValue: true,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "disableLink",
            helpText: "Controls parsing text as Link",
            label: "Disable Link",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      truncateButtonColor: "{{appsmith.theme.colors.primaryColor}}",
      fontFamily: "{{appsmith.theme.fontFamily.appFont}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
    };
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "General",
        children: [
          {
            propertyName: "fontFamily",
            label: "Font Family",
            helpText: "Controls the font family being used",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "System Default",
                value: "System Default",
              },
              {
                label: "Nunito Sans",
                value: "Nunito Sans",
              },
              {
                label: "Poppins",
                value: "Poppins",
              },
              {
                label: "Inter",
                value: "Inter",
              },
              {
                label: "Montserrat",
                value: "Montserrat",
              },
              {
                label: "Noto Sans",
                value: "Noto Sans",
              },
              {
                label: "Open Sans",
                value: "Open Sans",
              },
              {
                label: "Roboto",
                value: "Roboto",
              },
              {
                label: "Rubik",
                value: "Rubik",
              },
              {
                label: "Ubuntu",
                value: "Ubuntu",
              },
            ],
            defaultValue: "System Default",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
          },
          {
            propertyName: "manabieStyle",
            label: "Manabie Style",
            helpText: "Controls the common style in Manabie",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "None",
                value: "none",
              },
              {
                label: "H1",
                value: "manabie-h1",
              },
              {
                label: "H2",
                value: "manabie-h2",
              },
              {
                label: "H3",
                value: "manabie-h3",
              },
              {
                label: "H4",
                value: "manabie-h4",
              },
              {
                label: "H5",
                value: "manabie-h5",
              },
              {
                label: "H6",
                value: "manabie-h6",
              },
              {
                label: "Subtitle1",
                value: "manabie-subtitle1",
              },
              {
                label: "Subtitle2",
                value: "manabie-subtitle2",
              },
              {
                label: "Body1",
                value: "manabie-body1",
              },
              {
                label: "Body2",
                value: "manabie-body2",
              },
              {
                label: "Button",
                value: "manabie-button",
              },
              {
                label: "Caption",
                value: "manabie-caption",
              },
              {
                label: "Overline",
                value: "manabie-overline",
              },
            ],
            defaultValue: "none",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
          },
          {
            propertyName: "fontSize",
            label: "Font Size",
            helpText: "Controls the size of the font used",
            controlType: "DROP_DOWN",
            defaultValue: "1rem",
            options: [
              {
                label: "S",
                value: "0.875rem",
                subText: "0.875rem",
              },
              {
                label: "M",
                value: "1rem",
                subText: "1rem",
              },
              {
                label: "L",
                value: "1.25rem",
                subText: "1.25rem",
              },
              {
                label: "XL",
                value: "1.875rem",
                subText: "1.875rem",
              },
              {
                label: "XXL",
                value: "3rem",
                subText: "3rem",
              },
              {
                label: "3XL",
                value: "3.75rem",
                subText: "3.75rem",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
          },
        ],
      },
      {
        sectionName: "Color",
        children: [
          {
            propertyName: "textColor",
            label: "Text Color",
            helpText: "Controls the color of the text displayed",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                regex: /^(?![<|{{]).+/,
              },
            },
          },
          {
            propertyName: "backgroundColor",
            label: "Background Color",
            helpText: "Background color of the text added",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                regex: /^((?![<|{{]).+){0,1}/,
                expected: {
                  type: "string (HTML color name or HEX value)",
                  example: `red | #9C0D38`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
          },
          {
            helpText: "Use a html color name, HEX, RGB or RGBA value",
            placeholderText: "#FFFFFF / Gray / rgb(255, 99, 71)",
            propertyName: "borderColor",
            label: "Border Color",
            controlType: "COLOR_PICKER",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "truncateButtonColor",
            label: "Truncate Button Color",
            helpText: "Controls the color of the truncate button",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                regex: /^((?![<|{{]).+){0,1}/,
              },
            },
            dependencies: ["overflow"],
            hidden: (props: TextWidgetProps) => {
              return props.overflow !== OverflowTypes.TRUNCATE;
            },
          },
        ],
      },
      {
        sectionName: "Text Formatting",
        children: [
          {
            propertyName: "textAlign",
            label: "Alignment",
            helpText: "Controls the horizontal alignment of the text",
            controlType: "ICON_TABS",
            fullWidth: true,
            options: [
              {
                icon: "LEFT_ALIGN",
                value: "LEFT",
              },
              {
                icon: "CENTER_ALIGN",
                value: "CENTER",
              },
              {
                icon: "RIGHT_ALIGN",
                value: "RIGHT",
              },
            ],
            defaultValue: "LEFT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "fontStyle",
            label: "Emphasis",
            helpText: "Controls the font emphasis of the text displayed",
            controlType: "BUTTON_GROUP",
            options: [
              {
                icon: "BOLD_FONT",
                value: "BOLD",
              },
              {
                icon: "ITALICS_FONT",
                value: "ITALIC",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "Border and Shadow",
        children: [
          {
            helpText:
              "Enter value for border width which can also use as margin",
            propertyName: "borderWidth",
            label: "Border Width",
            placeholderText: "Enter value in px",
            controlType: "INPUT_TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
          },
          {
            helpText: "Enter value for border radius",
            propertyName: "borderRadius",
            label: "Border Radius (E.g: 1px)",
            placeholderText: "Enter text border radius",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "Enter value for border shadow",
            propertyName: "boxShadow",
            label: "Box shadow",
            placeholderText: "Enter value box shadow",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  /**
   * Disable html parsing for long continuous texts
   * @returns boolean
   */
  shouldDisableLink = (): boolean => {
    const text = this.props.text || "";
    const count: number = countOccurrences(text, "\n", false, 0);
    return (
      (count === 0 && text.length > MAX_HTML_PARSING_LENGTH) ||
      text.length > 50000
    );
  };

  getPageView() {
    const disableLink: boolean = this.props.disableLink
      ? true
      : this.shouldDisableLink();
    return (
      <TextContainer
        className="t--text-widget-container"
        {...pick(this.props, [
          "widgetId",
          "containerStyle",
          "borderColor",
          "borderWidth",
          "borderRadius",
          "boxShadow",
          "backgroundColor",
        ])}
      >
        <TextComponent
          accentColor={this.props.accentColor}
          backgroundColor={this.props.backgroundColor}
          bottomRow={this.props.bottomRow}
          disableLink={disableLink}
          fontFamily={this.props.fontFamily}
          manabieStyle={this.props.manabieStyle}
          fontSize={this.props.fontSize}
          fontStyle={this.props.fontStyle}
          isLoading={this.props.isLoading}
          key={this.props.widgetId}
          leftColumn={this.props.leftColumn}
          overflow={this.props.overflow}
          rightColumn={this.props.rightColumn}
          text={translate(
            this.props.lang,
            this.props.text || "",
            this.props.translationJp,
          )}
          textAlign={this.props.textAlign ? this.props.textAlign : "LEFT"}
          textColor={this.props.textColor}
          topRow={this.props.topRow}
          truncateButtonColor={
            this.props.truncateButtonColor || this.props.accentColor
          }
          widgetId={this.props.widgetId}
        />
      </TextContainer>
    );
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
      value: `{{ this.text }}`,
    };
  }

  static getWidgetType() {
    return "TEXT_WIDGET";
  }
}

export interface TextStyles {
  backgroundColor?: string;
  textColor?: string;
  fontStyle?: string;
  fontSize?: TextSize;
  textAlign?: TextAlign;
  truncateButtonColor?: string;
  fontFamily: string;
}

export interface TextWidgetProps extends WidgetProps, TextStyles {
  accentColor: string;
  text?: string;
  isLoading: boolean;
  disableLink: boolean;
  widgetId: string;
  containerStyle?: ContainerStyle;
  children?: ReactNode;
  borderColor?: Color;
  borderWidth?: number;
  overflow: OverflowTypes;
}

TextWidget.defaultProps = {
  ...BaseWidget.defaultProps,
  lang: LanguageEnums.EN,
};

const mapStateToProps = (state: AppState) => {
  return {
    lang: state.ui.appView.lang,
  };
};

export default connect(mapStateToProps, null)(TextWidget);
