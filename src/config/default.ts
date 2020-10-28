import { AlignmentStrategy } from './definitions';
import { IFormatterConfig, ITextAstSerializerConfig, IHtmlSerializerConfig } from './definitions';

let defaultCss = `
.constant.keyword {
  color: #c586c0;
}

.constant.unknown-node {
  color: red;
}

.constant {
  color: #d4d4d4;
}

.comment {
  color: #6A9955;
}

.identifier {
  color: #9cdcfe;
}

.identifier.method-call {
  color: #DCDCAA;
}

.operator {
  color: #d4d4d4;
}

.operator.operator-dot {
  color: #D4D4D4;
}

.operator.operator-keyword {
  color: #569CD6;
}

.operator.operator-unary {
  color: #569CD6;
}

.bracket {
  font-weight: bold;
}

.bracket-0 {
  color: Gold;
}

.bracket-1 {
  color: GoldenRod;
}

.bracket-2 {
  color: DarkGoldenRod;
}

.type {
  color: #4ec9b0;
}

.literal.null {
  color: #569cd6;
}

.literal.boolean {
  color: #569cd6;
}

.literal.string {
  color: #ce9178;
}

.literal {
  color: #dcdcaa;
}

body {
  font-family: monospace;
  background-color: #1e1e1e;
}`

export const defaultFormatterConfig: IFormatterConfig = {
  indentationLength: 2,
  lineWidth: 100,
  alignPairedLetExpressionsByEqual: AlignmentStrategy.singleline,
  alignPairedRecordExpressionsByEqual: AlignmentStrategy.singleline,
  includeComments: true,
  alignLineCommentsToPosition: null,
  indentSectionMembers: true,
  newLineCsvInLet: false,
}

export var defaultTextSerializerConfig: ITextAstSerializerConfig = {
  debugMode: false,
  indentation: "  ",
  lineEnd: "\n",
  ws: " ",
};

export var defaultHtmlSerializerConfig: IHtmlSerializerConfig = {
  debugMode: false,
  indentation: "&nbsp;&nbsp;",
  lineEnd: "<br/>",
  ws: "&nbsp;",
  numBrackets: 3,
  inlineCssToggle: true,
  inlineCss: defaultCss
};
