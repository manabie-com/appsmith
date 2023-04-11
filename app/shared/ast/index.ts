import {
  ObjectExpression,
  PropertyNode,
  isIdentifierNode,
  isVariableDeclarator,
  isObjectExpression,
  isLiteralNode,
  isPropertyNode,
  isPropertyAFunctionNode,
  isCallExpressionNode,
  getAST,
  extractIdentifierInfoFromCode,
  entityRefactorFromCode,
  extractInvalidTopLevelMemberExpressionsFromCode,
  getFunctionalParamsFromNode,
  isTypeOfFunction,
  MemberExpressionData,
  IdentifierInfo,
} from "./src";

// constants
import { ECMA_VERSION, SourceType, NodeTypes } from "./src/constants";

// JSObjects
import {
  parseJSObject,
  isJSFunctionProperty,
  TParsedJSProperty,
  JSPropertyPosition,
} from "./src/jsObject";

// action creator
import {
  getTextArgumentAtPosition,
  setTextArgumentAtPosition,
  getEnumArgumentAtPosition,
  setEnumArgumentAtPosition,
  getModalName,
  setModalName,
  getFuncExpressionAtPosition,
  getFunction,
  replaceActionInQuery,
  setCallbackFunctionField,
  getActionBlocks,
  getFunctionBodyStatements,
  getMainAction,
  getFunctionName,
  setObjectAtPosition,
  getThenCatchBlocksFromQuery,
  setThenBlockInQuery,
  setCatchBlockInQuery,
  getFunctionArguments,
  getFunctionNameFromJsObjectExpression,
  getCallExpressions,
  canTranslateToUI,
  getFunctionParams,
  getQueryParam,
  setQueryParam,
  checkIfCatchBlockExists,
  checkIfThenBlockExists,
  checkIfArgumentExistAtPosition,
} from "./src/actionCreator";

// types or interfaces should be exported with type keyword, while enums can be exported like normal functions
export type {
  ObjectExpression,
  PropertyNode,
  MemberExpressionData,
  IdentifierInfo,
  TParsedJSProperty,
  JSPropertyPosition,
};

export {
  isIdentifierNode,
  isVariableDeclarator,
  isObjectExpression,
  isLiteralNode,
  isPropertyNode,
  isPropertyAFunctionNode,
  isCallExpressionNode,
  getAST,
  extractIdentifierInfoFromCode,
  entityRefactorFromCode,
  extractInvalidTopLevelMemberExpressionsFromCode,
  getFunctionalParamsFromNode,
  isTypeOfFunction,
  parseJSObject,
  ECMA_VERSION,
  SourceType,
  NodeTypes,
  getTextArgumentAtPosition,
  getEnumArgumentAtPosition,
  getModalName,
  setModalName,
  setTextArgumentAtPosition,
  setEnumArgumentAtPosition,
  getFuncExpressionAtPosition,
  getFunction,
  replaceActionInQuery,
  setCallbackFunctionField,
  getActionBlocks,
  getFunctionBodyStatements,
  getMainAction,
  getFunctionName,
  setObjectAtPosition,
  getThenCatchBlocksFromQuery,
  setThenBlockInQuery,
  setCatchBlockInQuery,
  getFunctionArguments,
  getFunctionNameFromJsObjectExpression,
  getCallExpressions,
  canTranslateToUI,
  getFunctionParams,
  getQueryParam,
  setQueryParam,
  checkIfThenBlockExists,
  checkIfCatchBlockExists,
  checkIfArgumentExistAtPosition,
  isJSFunctionProperty,
};
