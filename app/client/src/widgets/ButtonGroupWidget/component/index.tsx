import type { RefObject } from "react";
import React, { createRef, Suspense, lazy } from "react";
import { sortBy } from "lodash";
import {
  Alignment,
  Icon,
  Menu,
  MenuItem,
  Classes as CoreClass,
  Spinner,
} from "@blueprintjs/core";
import { Classes, Popover2 } from "@blueprintjs/popover2";
import type { IconName } from "@blueprintjs/icons";
import tinycolor from "tinycolor2";
import { darkenActive, darkenHover } from "constants/DefaultTheme";
import type {
  ButtonStyleType,
  ButtonVariant,
  ButtonPlacement,
} from "components/constants";
import { ButtonVariantTypes } from "components/constants";
import styled, { createGlobalStyle } from "styled-components";
import {
  getCustomBackgroundColor,
  getCustomBorderColor,
  getCustomJustifyContent,
  getComplementaryGrayscaleColor,
} from "widgets/WidgetUtils";
import type { RenderMode } from "constants/WidgetConstants";
import { RenderModes } from "constants/WidgetConstants";
import { DragContainer } from "widgets/ButtonWidget/component/DragContainer";
import { buttonHoverActiveStyles } from "../../ButtonWidget/component/utils";
import { THEMEING_TEXT_SIZES } from "constants/ThemeConstants";
import type { ThemeProp } from "widgets/constants";
import type { LanguageEnums } from "entities/App";
import type { AppState } from "ce/reducers";
import { connect } from "react-redux";
import { translate } from "utils/translate";
import { BUTTON_GROUP_POPOVER_WITH_MODE } from "../constants";

// Utility functions
interface ButtonData {
  id?: string;
  type?: string;
  label?: string;
  iconName?: string;
}
// Extract props influencing to width change
const getButtonData = (
  groupButtons: Record<string, GroupButtonProps>,
): ButtonData[] => {
  const buttonData = Object.keys(groupButtons).reduce(
    (acc: ButtonData[], id) => {
      return [
        ...acc,
        {
          id,
          type: groupButtons[id].buttonType,
          label: groupButtons[id].label,
          iconName: groupButtons[id].iconName,
        },
      ];
    },
    [],
  );

  return buttonData as ButtonData[];
};

interface WrapperStyleProps {
  isHorizontal: boolean;
  borderRadius?: string;
  boxShadow?: string;
  buttonVariant: ButtonVariant;
}

const ButtonGroupWrapper = styled.div<ThemeProp & WrapperStyleProps>`
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  overflow: hidden;
  cursor: not-allowed;
  gap: ${({ buttonVariant }) =>
    `${buttonVariant === ButtonVariantTypes.PRIMARY ? "1px" : "0px"}`};

  ${(props) =>
    props.isHorizontal ? "flex-direction: row" : "flex-direction: column"};
  box-shadow: ${({ boxShadow }) => boxShadow};
  border-radius: ${({ borderRadius }) => borderRadius};

  & > *:first-child,
  & > *:first-child button {
    border-radius: ${({ borderRadius, isHorizontal }) =>
      isHorizontal
        ? `${borderRadius} 0px 0px ${borderRadius}`
        : `${borderRadius} ${borderRadius} 0px 0px`};
  }

  & > *:last-child,
  & > *:last-child button {
    border-radius: ${({ borderRadius, isHorizontal }) =>
      isHorizontal
        ? `0px ${borderRadius} ${borderRadius} 0`
        : `0px 0px ${borderRadius} ${borderRadius}`};
  }
`;

const MenuButtonWrapper = styled.div<{ renderMode: RenderMode }>`
  flex: 1 1 auto;
  cursor: pointer;
  position: relative;

  ${({ renderMode }) => renderMode === RenderModes.CANVAS && `height: 100%`};

  & > .${Classes.POPOVER2_TARGET} > button {
    width: 100%;
    height: 100%;
  }

  & > .${Classes.POPOVER2_TARGET} {
    height: 100%;
  }
`;

const PopoverStyles = createGlobalStyle<{
  minPopoverWidth: number;
  popoverWidthMode: BUTTON_GROUP_POPOVER_WITH_MODE;
  popoverTargetWidth?: number;
  id: string;
  borderRadius?: string;
}>`
  ${({
    borderRadius,
    id,
    minPopoverWidth,
    popoverWidthMode,
    popoverTargetWidth,
  }) => `
    .${id}.${Classes.POPOVER2} {
      background: none;
      box-shadow: 0 6px 20px 0px rgba(0, 0, 0, 0.15) !important;
      margin-top: 8px !important;
      margin-bottom: 8px !important;
      border-radius: ${
        borderRadius === THEMEING_TEXT_SIZES.lg ? `0.375rem` : borderRadius
      };
      box-shadow: none;
      overflow: hidden;
      ${popoverTargetWidth && `width: ${popoverTargetWidth}px`};
      ${
        popoverWidthMode === BUTTON_GROUP_POPOVER_WITH_MODE.AUTO &&
        `min-width: ${minPopoverWidth}px`
      }
    }

    .button-group-menu-popover > .${Classes.POPOVER2_CONTENT} {
      background: none;
    }
  `}
`;

interface ButtonStyleProps {
  isHorizontal: boolean;
  borderRadius?: string;
  buttonVariant?: ButtonVariant; // solid | outline | ghost
  buttonColor?: string;
  iconAlign?: string;
  placement?: ButtonPlacement;
  isLabel: boolean;
  textColor?: string;
}

/*
  Don't use buttonHoverActiveStyles in a nested function it won't work -

  const buttonHoverActiveStyles = css ``

  const Button = styled.button`
  // won't work
    ${({ buttonColor, theme }) => {
      &:hover, &:active {
        ${buttonHoverActiveStyles}
      }
    }}

  // will work
  &:hover, &:active {
    ${buttonHoverActiveStyles}
  }`
*/

const StyledButton = styled.button<ThemeProp & ButtonStyleProps>`
  flex: 1 1 auto;
  display: flex;
  justify-content: stretch;
  align-items: center;
  padding: 0px 10px;

  .auto-layout & {
    min-height: 32px;
    min-width: 120px;
  }

  &:hover,
  &:active,
  &:focus {
    ${buttonHoverActiveStyles}
  }

  ${({ buttonColor, buttonVariant, iconAlign, isLabel, theme, textColor }) => `
    & {
      background: ${
        getCustomBackgroundColor(buttonVariant, buttonColor) !== "none"
          ? getCustomBackgroundColor(buttonVariant, buttonColor)
          : buttonVariant === ButtonVariantTypes.PRIMARY
          ? theme.colors.button.primary.primary.bgColor
          : "none"
      } !important;
      flex-direction : ${iconAlign === "right" ? "row-reverse" : "row"};
      .bp3-icon {
        ${
          isLabel
            ? iconAlign === "right"
              ? "margin-left: 10px"
              : "margin-right: 10px"
            : ""
        };
      }
    }

    border: ${
      getCustomBorderColor(buttonVariant, buttonColor) !== "none"
        ? `1px solid ${getCustomBorderColor(buttonVariant, buttonColor)}`
        : buttonVariant === ButtonVariantTypes.SECONDARY
        ? `1px solid ${theme.colors.button.primary.secondary.borderColor}`
        : "none"
    } ${buttonVariant === ButtonVariantTypes.PRIMARY ? "" : "!important"};

    & span {
      color: ${
        textColor
          ? textColor
          : buttonVariant === ButtonVariantTypes.PRIMARY
          ? getComplementaryGrayscaleColor(buttonColor)
          : getCustomBackgroundColor(ButtonVariantTypes.PRIMARY, buttonColor)
      } !important;
    }


    &:disabled {
      cursor: not-allowed;
      border: ${
        buttonVariant === ButtonVariantTypes.SECONDARY &&
        "1px solid var(--wds-color-border-disabled)"
      } !important;
      background: ${
        buttonVariant !== ButtonVariantTypes.TERTIARY &&
        "var(--wds-color-bg-disabled)"
      } !important;

      span {
        color: var(--wds-color-text-disabled) !important;
      }
    }

  `}
`;

const StyledButtonContent = styled.div<{
  iconAlign: string;
  placement?: ButtonPlacement;
}>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: ${({ placement }) => getCustomJustifyContent(placement)};
  flex-direction: ${({ iconAlign }) =>
    iconAlign === Alignment.RIGHT ? "row-reverse" : "row"};
`;

export interface BaseStyleProps {
  backgroundColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  buttonColor?: string;
  buttonStyle?: ButtonStyleType;
  buttonVariant?: ButtonVariant;
  textColor?: string;
}

const BaseMenuItem = styled(MenuItem)<ThemeProp & BaseStyleProps>`
  padding: 8px 10px !important;
  border-radius: 0px;
  ${({ backgroundColor, theme }) =>
    backgroundColor
      ? `
      background-color: ${backgroundColor} !important;
      &:hover, &:focus {
        background-color: ${darkenHover(backgroundColor)} !important;
      }
      &:active {
        background-color: ${darkenActive(backgroundColor)} !important;
      }
  `
      : `
    background: none !important
      &:hover, &:focus {
        background-color: ${tinycolor(
          theme.colors.button.primary.primary.textColor,
        )
          .darken()
          .toString()} !important;
      }
      &:active {
        background-color: ${tinycolor(
          theme.colors.button.primary.primary.textColor,
        )
          .darken()
          .toString()} !important;
      }
    `}
  ${({ textColor }) =>
    textColor &&
    `
      color: ${textColor} !important;
  `}
`;

const StyledMenu = styled(Menu)`
  padding: 0;
  min-width: 0px;
`;
const customIconWrapper = (path: any) => {
  if (!path) return null;
  return <span className="bp3-icon">{path}</span>;
};

const DynamicIconComponent = ({
  iconName,
  fillColor,
}: {
  iconName: string;
  fillColor?: string;
}) => {
  const IconComponent = lazy(() =>
    import(`constants/Icons/${iconName}24Px`).catch(() => ({
      default: () => null,
    })),
  );
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IconComponent
        x="0px"
        y="0px"
        style={fillColor ? { fill: fillColor } : {}}
        viewBox={`0 0 24 24`}
      />
    </Suspense>
  );
};
interface PopoverContentProps {
  buttonId: string;
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      translationJp?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      muiIcon?: string;
      muiIconColor?: string;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
  lang?: LanguageEnums;
  onItemClicked: (onClick: string | undefined, buttonId: string) => void;
}

function PopoverContent(props: PopoverContentProps) {
  const { buttonId, menuItems, onItemClicked, lang } = props;

  let items = Object.keys(menuItems)
    .map((itemKey) => menuItems[itemKey])
    .filter((item) => item.isVisible === true);
  // sort btns by index
  items = sortBy(items, ["index"]);

  const listItems = items.map((menuItem) => {
    const {
      backgroundColor,
      iconAlign,
      iconColor,
      iconName,
      id,
      isDisabled,
      label,
      onClick,
      textColor,
      translationJp,
      muiIcon,
      muiIconColor,
    } = menuItem;
    return (
      <BaseMenuItem
        backgroundColor={backgroundColor}
        disabled={isDisabled}
        icon={
          iconAlign !== Alignment.RIGHT && iconName ? (
            <Icon
              color={iconColor}
              icon={
                muiIcon
                  ? customIconWrapper(
                      <DynamicIconComponent
                        iconName={muiIcon}
                        fillColor={muiIconColor}
                      />,
                    )
                  : iconName
              }
            />
          ) : null
        }
        key={id}
        labelElement={
          iconAlign === Alignment.RIGHT && iconName ? (
            <Icon
              color={iconColor}
              icon={
                muiIcon
                  ? customIconWrapper(
                      <DynamicIconComponent
                        iconName={muiIcon}
                        fillColor={muiIconColor}
                      />,
                    )
                  : iconName
              }
            />
          ) : null
        }
        onClick={() => onItemClicked(onClick, buttonId)}
        text={translate(lang, label, translationJp)}
        textColor={textColor}
      />
    );
  });

  return <StyledMenu>{listItems}</StyledMenu>;
}

class ButtonGroupComponent extends React.Component<
  ButtonGroupComponentProps,
  ButtonGroupComponentState
> {
  private timer?: number;

  constructor(props: ButtonGroupComponentProps) {
    super(props);
    this.state = {
      itemRefs: {},
      itemWidths: {},
      loadedBtnId: "",
    };
  }

  componentDidMount() {
    this.setState(() => {
      return {
        ...this.state,
        itemRefs: this.createMenuButtonRefs(),
      };
    });

    // @ts-expect-error: setTimeout return type mismatch
    this.timer = setTimeout(() => {
      this.setState(() => {
        return {
          ...this.state,
          itemWidths: this.getMenuButtonWidths(),
        };
      });
    }, 0);
  }

  componentDidUpdate(
    prevProps: ButtonGroupComponentProps,
    prevState: ButtonGroupComponentState,
  ) {
    if (
      this.state.itemRefs !== prevState.itemRefs ||
      this.props.width !== prevProps.width ||
      this.props.orientation !== prevProps.orientation ||
      this.props.popoverWidthMode !== prevProps.popoverWidthMode
    ) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.setState(() => {
          return {
            ...this.state,
            itemWidths: this.getMenuButtonWidths(),
          };
        });
      });
    } else {
      // Reset refs array if
      // * A button is added/removed or changed into a menu button
      // * A label is changed or icon is newly added or removed
      let isWidthChanged = false;
      const buttons = getButtonData(this.props.groupButtons);
      const menuButtons = buttons.filter((button) => button.type === "MENU");
      const prevButtons = getButtonData(prevProps.groupButtons);
      const prevMenuButtons = prevButtons.filter(
        (button) => button.type === "MENU",
      );

      if (buttons.length !== prevButtons.length) {
        isWidthChanged = true;
      } else if (menuButtons.length > prevMenuButtons.length) {
        isWidthChanged = true;
      } else {
        isWidthChanged = buttons.some((button) => {
          const prevButton = prevButtons.find((btn) => btn.id === button.id);

          return (
            button.label !== prevButton?.label ||
            (button.iconName && !prevButton?.iconName) ||
            (!button.iconName && prevButton?.iconName)
          );
        });
      }

      if (isWidthChanged) {
        this.setState(() => {
          return {
            ...this.state,
            itemRefs: this.createMenuButtonRefs(),
          };
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  // Get widths of menu buttons
  getMenuButtonWidths = () =>
    Object.keys(this.props.groupButtons).reduce((acc, id) => {
      if (this.props.groupButtons[id].buttonType === "MENU") {
        return {
          ...acc,
          [id]:
            this.props.popoverWidthMode === BUTTON_GROUP_POPOVER_WITH_MODE.AUTO
              ? this.state.itemRefs[id].current?.getBoundingClientRect().width
              : this.props.valuePopoverWidth,
        };
      }
      return acc;
    }, {});

  // Create refs of menu buttons
  createMenuButtonRefs = () =>
    Object.keys(this.props.groupButtons).reduce((acc, id) => {
      if (this.props.groupButtons[id].buttonType === "MENU") {
        return {
          ...acc,
          [id]: createRef(),
        };
      }
      return acc;
    }, {});

  // Start Loading
  handleActionStart = (id: string) => {
    this.setState({
      loadedBtnId: id,
    });
  };

  // Stop Loading
  handleActionComplete = () => {
    this.setState({
      loadedBtnId: "",
    });
  };

  onButtonClick = (onClick: string | undefined, buttonId: string) => {
    if (onClick) {
      this.handleActionStart(buttonId);
      this.props.buttonClickHandler(onClick, () => this.handleActionComplete());
    }
  };

  render = () => {
    const {
      buttonVariant,
      groupButtons,
      isDisabled,
      minPopoverWidth,
      popoverWidthMode,
      orientation,
      widgetId,
      lang,
    } = this.props;
    const { loadedBtnId } = this.state;
    const isHorizontal = orientation === "horizontal";

    let items = Object.keys(groupButtons)
      .map((itemKey) => groupButtons[itemKey])
      .filter((item) => item.isVisible === true);
    // sort btns by index
    items = sortBy(items, ["index"]);
    const popoverId = `button-group-${widgetId}`;

    return (
      <ButtonGroupWrapper
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        buttonVariant={this.props.buttonVariant}
        className="t--buttongroup-widget"
        isHorizontal={isHorizontal}
      >
        {items.map((button) => {
          const isLoading = button.id === loadedBtnId;
          const isButtonDisabled =
            button.isDisabled || isDisabled || !!loadedBtnId || isLoading;
          if (button.buttonType === "MENU" && !isButtonDisabled) {
            const { menuItems } = button;

            return (
              <MenuButtonWrapper
                key={button.id}
                renderMode={this.props.renderMode}
              >
                <PopoverStyles
                  borderRadius={this.props.borderRadius}
                  id={popoverId}
                  minPopoverWidth={minPopoverWidth}
                  popoverWidthMode={popoverWidthMode}
                  popoverTargetWidth={this.state.itemWidths[button.id]}
                />
                <Popover2
                  content={
                    <PopoverContent
                      buttonId={button.id}
                      menuItems={menuItems || {}}
                      onItemClicked={this.onButtonClick}
                      lang={lang}
                    />
                  }
                  disabled={button.isDisabled}
                  fill
                  minimal
                  placement="bottom-end"
                  popoverClassName={popoverId}
                >
                  <DragContainer
                    buttonColor={button.buttonColor}
                    buttonVariant={buttonVariant}
                    disabled={isButtonDisabled}
                    loading={!!loadedBtnId}
                    renderMode={this.props.renderMode}
                  >
                    <StyledButton
                      borderRadius={this.props.borderRadius}
                      buttonColor={button.buttonColor}
                      textColor={button.textColor}
                      buttonVariant={buttonVariant}
                      disabled={isButtonDisabled}
                      iconAlign={button.iconAlign}
                      isHorizontal={isHorizontal}
                      isLabel={!!button.label}
                      key={button.id}
                      ref={this.state.itemRefs[button.id]}
                    >
                      <StyledButtonContent
                        iconAlign={button.iconAlign || "left"}
                        placement={button.placement}
                      >
                        {isLoading ? (
                          <Spinner size={18} />
                        ) : (
                          <>
                            {button.iconName && (
                              <Icon
                                icon={
                                  button.muiIcon
                                    ? customIconWrapper(
                                        <DynamicIconComponent
                                          iconName={button.muiIcon}
                                          fillColor={button.muiIconColor}
                                        />,
                                      )
                                    : button.iconName
                                }
                              />
                            )}
                            {!!button.label && (
                              <span className={CoreClass.BUTTON_TEXT}>
                                {translate(
                                  lang,
                                  button.label,
                                  button.translationJp,
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </StyledButtonContent>
                    </StyledButton>
                  </DragContainer>
                </Popover2>
              </MenuButtonWrapper>
            );
          }
          return (
            <DragContainer
              buttonColor={button.buttonColor}
              buttonVariant={buttonVariant}
              disabled={isButtonDisabled}
              key={button.id}
              loading={!!loadedBtnId}
              onClick={() => {
                this.onButtonClick(button.onClick, button.id);
              }}
              renderMode={this.props.renderMode}
              style={{ flex: "1 1 auto" }}
            >
              <StyledButton
                borderRadius={this.props.borderRadius}
                buttonColor={button.buttonColor}
                textColor={button.textColor}
                buttonVariant={buttonVariant}
                disabled={isButtonDisabled}
                iconAlign={button.iconAlign}
                isHorizontal={isHorizontal}
                isLabel={!!button.label}
                onClick={() => this.onButtonClick(button.onClick, button.id)}
              >
                <StyledButtonContent
                  iconAlign={button.iconAlign || "left"}
                  placement={button.placement}
                >
                  {isLoading ? (
                    <Spinner size={18} />
                  ) : (
                    <>
                      {button.iconName && (
                        <Icon
                          icon={
                            button.muiIcon
                              ? customIconWrapper(
                                  <DynamicIconComponent
                                    iconName={button.muiIcon}
                                    fillColor={button.muiIconColor}
                                  />,
                                )
                              : button.iconName
                          }
                        />
                      )}
                      {!!button.label && (
                        <span className={CoreClass.BUTTON_TEXT}>
                          {translate(lang, button.label, button.translationJp)}
                        </span>
                      )}
                    </>
                  )}
                </StyledButtonContent>
              </StyledButton>
            </DragContainer>
          );
        })}
      </ButtonGroupWrapper>
    );
  };
}

interface GroupButtonProps {
  widgetId: string;
  id: string;
  index: number;
  isVisible?: boolean;
  isDisabled?: boolean;
  label?: string;
  translationJp?: string;
  buttonType?: string;
  buttonColor?: string;
  textColor?: string;
  iconName?: IconName;
  muiIcon?: string;
  muiIconColor?: string;
  iconAlign?: Alignment;
  placement?: ButtonPlacement;
  onClick?: string;
  menuItems: Record<
    string,
    {
      widgetId: string;
      id: string;
      index: number;
      isVisible?: boolean;
      isDisabled?: boolean;
      label?: string;
      translationJp?: string;
      backgroundColor?: string;
      textColor?: string;
      iconName?: IconName;
      muiIcon?: string;
      muiIconColor?: string;
      iconColor?: string;
      iconAlign?: Alignment;
      onClick?: string;
    }
  >;
}

export interface ButtonGroupComponentProps {
  borderRadius?: string;
  boxShadow?: string;
  buttonVariant: ButtonVariant;
  buttonClickHandler: (
    onClick: string | undefined,
    callback: () => void,
  ) => void;
  groupButtons: Record<string, GroupButtonProps>;
  isDisabled: boolean;
  orientation: string;
  popoverWidthMode: BUTTON_GROUP_POPOVER_WITH_MODE;
  valuePopoverWidth?: number;
  renderMode: RenderMode;
  width: number;
  minPopoverWidth: number;
  widgetId: string;
  lang?: LanguageEnums;
}

export interface ButtonGroupComponentState {
  itemRefs: Record<string, RefObject<HTMLButtonElement>>;
  itemWidths: Record<string, number>;
  loadedBtnId: string;
}

const mapStateToProps = (state: AppState) => {
  return {
    lang: state.ui.appView.lang,
  };
};

export default connect(mapStateToProps, null)(ButtonGroupComponent);
