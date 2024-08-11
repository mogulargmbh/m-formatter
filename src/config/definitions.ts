export enum AlignmentStrategy
{
  never = "never",          //Never align
  always = "always",        //Always align
  singleline = "singleline" //Only align when all expressions in the current scope are single line and won't exceed their line length when aligned by the equal sign.
}

export interface IFormatterConfig 
{
  lineWidth: number;                                        //(default=100) the number of characters in one line that serves for the formatter as a limit
  indentationLength: number;                                //(default=2) the number of indentation characters used for indentation
  alignPairedLetExpressionsByEqual: AlignmentStrategy;      //(default="singleline") align paired expressions that are children of a let expression by the equal chaaracters
  alignPairedRecordExpressionsByEqual: AlignmentStrategy;   //(default="singleline") align paired expressions that are children of a record expression by the equal character 
  alignLineCommentsToPosition: number;                      //(default=null) align line end comments (starting with "//" and in non empty code lines) to a specific position. Null of no alignment should happen.
  includeComments: boolean;                                 //(default=true) toggle include or exclude comments
  indentSectionMembers: boolean;                            //(default=true) toggle indentation of section members
  surroundBracesWithWs: boolean;
  replaceLfInStrings: boolean;                              //(default=false) replace #lf in strings with newline
  //newlineCsvInLet
}

export interface ITextAstSerializerConfig 
{
  ws: string;               //(default: " ") character to use as whitespace
  lineEnd: string;          //(default: "\n") character to use as line break
}

export interface IHtmlAstSerializerConfig {
  debugMode: boolean;
  ws: string;               //(default: "&nbsp;") character to use as whitespace
  lineEnd: string;          //(default: "<br/>") character to use as line break
  numBrackets: number;      //number of colorized distinct brackets. Brackets can be styled with bracket-{number} css class.
}