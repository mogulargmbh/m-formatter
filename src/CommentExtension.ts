import { IFormatterConfig } from './config/definitions';
import { TComment } from './pq-ast';
import { ExtendedNode, Range, IFormatState, FormatResult } from './base/Base';

type ICommentExtensionBase = {
  trailingNewLine: boolean,
  leadingNewLine: boolean,
  range: Range,
  text: string
  initialize: (node: ExtendedNode, sourceCode: string) => void;
  format: (state: IFormatState, config: IFormatterConfig, suppressLeadingLineBreak?: boolean) => [FormatResult, IFormatState];
  updateTokenRange: () => void;
}

export type ExtendedComment = TComment & ICommentExtensionBase;

export function extendComment(comment: TComment, node: ExtendedNode, code: string): ExtendedComment
{
  let res = {
    ...comment,
    ...CommentExtensionBase
  };
  res.initialize(node, code);
  return res;
}

const CommentExtensionBase: ICommentExtensionBase = {
  leadingNewLine: false,
  trailingNewLine: false,
  range: null,
  text: null,
  initialize: function(this: ExtendedComment, node: ExtendedNode, sourceCode: string) {
    this.range = {
      start: null,
      end: null,
    }
    this.trailingNewLine = this.positionStart.lineNumber != node.tokenRange.positionStart.lineNumber;
    
    let lastNode: ExtendedNode = null
    if(node.parent)
    {
      let idx = node.parent.children.indexOf(node);
      lastNode = node.parent.children[idx - 1] ?? node.parent;
    }
    
    this.leadingNewLine = lastNode && lastNode.tokenRange.positionStart.lineNumber != this.positionStart.lineNumber;
    
    this.text = sourceCode.substring(this.positionStart.codeUnit, this.positionEnd.codeUnit).trim().replace(/\n/g, "\n");
  },
  updateTokenRange: function(this: ExtendedComment) {
    Object.assign(this.positionStart, {
        lineNumber: this.range.start.line,
        lineCodeUnit: this.range.start.unit
    });
    Object.assign(this.positionEnd, {
      lineNumber: this.range.end.line,
      lineCodeUnit: this.range.end.unit
    });
  },
  format: function(this: ExtendedComment, state: IFormatState, config: IFormatterConfig, suppressLeadingLineBreak = false): [FormatResult, IFormatState] {
    let { line, unit } = state;
    
    if((this.trailingNewLine == true || this.leadingNewLine == true) && state.stopOnLineBreak == true)
      return [FormatResult.Break, state];
    
    if(this.leadingNewLine == true && suppressLeadingLineBreak == false)
    {
      if(state.suppressInitialLineBreak != true)
        line = state.line + 1;
        
      unit = config.indentationLength * state.indent;
      this.range.start = {
        line,
        unit,
      }
      unit += this.text.length;
      this.range.end = {
        line,
        unit
      }
    }
    else
    {
      line = state.line;
      unit = state.unit;
      this.range.start = {
        line,
        unit
      }
      
      unit += this.text.length;
      this.range.end = {
        line,
        unit: unit
      }
    }
    
    if(this.trailingNewLine == true)
    {
      unit = config.indentationLength * state.indent;
      line++;
    }
    
    let resultState = {
      ...state,
      line,
      unit
    }
    
    return [FormatResult.Ok, resultState];
  }
}