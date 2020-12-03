import { AlignmentStrategy } from './definitions';
import { IFormatterConfig, ITextAstSerializerConfig, IHtmlAstSerializerConfig } from './definitions';


export const defaultFormatterConfig: IFormatterConfig = {
  indentationLength: 2,
  lineWidth: 100,
  alignPairedLetExpressionsByEqual: AlignmentStrategy.singleline,
  alignPairedRecordExpressionsByEqual: AlignmentStrategy.singleline,
  includeComments: true,
  alignLineCommentsToPosition: null,
  indentSectionMembers: true,
  // newLineCsvInLet: false,
}

export var defaultTextSerializerConfig: ITextAstSerializerConfig = {
  lineEnd: "\n",
  ws: " ",
};

export var defaultHtmlSerializerConfig: IHtmlAstSerializerConfig = {
  debugMode: false,
  lineEnd: "<br/>",
  ws: "&nbsp;",
  numBrackets: 3,
};
