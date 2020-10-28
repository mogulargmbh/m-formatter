import { FormatError } from '../Error';
import { Optional } from '../interfaces';

export enum AlignmentStrategy
{
  //Never align
  never = "never",
  //Always align
  always = "always",
  //Only align when all expressions in the current scope are single line and won't exceed their line length when aligned by the equal sign.
  singleline = "singleline"
}

export interface IFormatterConfig
{
  //Maximum line width, default = 100. The formatter forces expression to break into several lines if the maximum line width would be reached. Please not some expressions cannot be broken into multiple lines such as very long identifiers and therefore the maximum line width can be exceeded in these cases. As of now there is no warning to give you info about that.
  lineWidth: number;
  //Length of the indentation string (is used for determining when the max line width is reached)
  indentationLength: number;
  //Includes comments in the format results, default = true
  includeComments: boolean;
  //Newline after CSV under LetExpression
  newLineCsvInLet: boolean;
  //Indent section members
  indentSectionMembers: boolean;
  //Align line comments
  alignLineCommentsToPosition: number;
  //Align paired expressions by their equal sign, default = false.
  alignPairedLetExpressionsByEqual: AlignmentStrategy;
  //Align paired expressions by their equal sign, default = false.
  alignPairedRecordExpressionsByEqual: AlignmentStrategy;
}

export interface ITextAstSerializerConfig
{
  debugMode?: boolean;
  //String that is used as a whitespace, default = " "
  ws: string;
  //String that is used for indentation, default = "  ". Indentation length of FormatterConfig must be set accordingly
  indentation: string;
  //String that is used to terminate a line, default = "\n"
  lineEnd: string;
}

export interface IHtmlSerializerConfig
{
  debugMode?: boolean;
  //String that is used as a whitespace, default = "&nbsp;"
  ws: string;
  //String that is used for indentation, default = "&nbsp;&nbsp;". Indentation length of FormatterConfig must be set accordingly
  indentation: string;
  //String that is used to terminate a line, default = "<br/>"
  lineEnd: string;
  //Number of different bracket classes, default = 3. The formatter assigns bracket pairs the classes 'bracket' and 'bracket-{num}' where num = 1...{numBrackets}. You can then style your matching brackets with configurable depth.
  numBrackets: number;
  //If null the formatter will put classes onto the resulting html but not styles (can be used for websites where you want to style the formatted html with css yourself). If non null the classes will be translated to inline styles on the html elements. See below for more information about the used classes.
  inlineCss: string;
  //Toggles inline css usage;
  inlineCssToggle: boolean;
  //Includes comments in the format results, default = true
}



