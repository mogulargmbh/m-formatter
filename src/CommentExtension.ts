import { IFormatterConfig } from './config/definitions';
import { TComment } from './pq-ast';
import { ExtendedNode, Range, IFormatState, FormatResult } from './base/Base';
import { assertnever } from './Util';

type ICommentExtensionBase = {
  trailingNewLine: boolean,
  leadingNewLine: boolean,
  range: Range,
  node: ExtendedNode,
  initialize: (node: ExtendedNode) => void;
  format: (state: IFormatState, config: IFormatterConfig, suppressLeadingLineBreak?: boolean) => FormatResult;
  updateTokenRange: () => void;
}

type TCommentKind = "prev"|"trail";

export type ExtendedComment = TComment & ICommentExtensionBase & { commentKind: TCommentKind };

export function extendComment(comment: TComment, node: ExtendedNode, kind: TCommentKind): ExtendedComment
{
  let res: ExtendedComment = {
    ...comment,
    ...CommentExtensionBase,
    commentKind: kind
  };
  res.initialize(node);
  return res;
}

function getPreviousNode(node: ExtendedNode): ExtendedNode
{
  if(node.parent)
  {
    let idx = node.parent.children.indexOf(node);
    return node.parent.children[idx - 1] ?? node.parent;
  }
  return null;
}

const CommentExtensionBase: ICommentExtensionBase = {
  leadingNewLine: false,
  trailingNewLine: false,
  node: null,
  range: null,
  initialize: function(this: ExtendedComment, node: ExtendedNode) {
    this.node = node;
    this.range = {
      start: null,
      end: null,
    }
    this.trailingNewLine = this.positionStart.lineNumber != node.tokenRange.positionStart.lineNumber;
    
    let lastNode: ExtendedNode = getPreviousNode(node);
    this.leadingNewLine = lastNode && lastNode.tokenRange.positionEnd.lineNumber != this.positionStart.lineNumber;
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
  format: function(this: ExtendedComment, state: IFormatState, config: IFormatterConfig, suppressLeadingLineBreak = false): FormatResult {
    let { line, unit } = state;
    
    switch(this.commentKind)
    {
      case "trail": 
      {
        if(this.positionStart.lineNumber != this.node.tokenRange.positionEnd.lineNumber)
        {
          line += 1;
          unit = config.indentationLength * state.indent;
          this.range.start = {
            line,
            unit: config.indentationLength * state.indent
          };
        }
        else
        {
          unit += 1;
          unit = Math.max(unit, config.alignLineCommentsToPosition ?? 0);
          this.range.start = {
            line,
            unit
          };
        }
        
        this.range.end = {
          line,
          unit: unit + this.data.length
        }
        return FormatResult.Ok;
      }
      case "prev":
      {
        if(this.leadingNewLine == true && state.suppressInitialLineBreak == false)
        {
          line += 1;
          unit = config.indentationLength * state.indent;
          this.range.start = {
            line,
            unit
          };
        }
        else
        {
          this.range.start = {
            line,
            unit
          }
        }
        
        if(this.trailingNewLine == true)
        {
          this.range.end = {
            line: line + 1,
            unit: config.indentationLength * state.indent
          }
        }
        else
        {
          this.range.end = {
            line: line,
            unit: unit + this.data.length
          }
        }
        return FormatResult.Ok;
      }
      default: 
      {
        assertnever(this.commentKind);
      }
    }
    
    // if((this.trailingNewLine == true || this.leadingNewLine == true) && state.stopOnLineBreak == true)
    //   return FormatResult.Break;
    
    // if(this.leadingNewLine == true && suppressLeadingLineBreak == false)
    // {
    //   if(state.suppressInitialLineBreak != true)
    //     line = state.line + 1;
        
    //   unit = config.indentationLength * state.indent;
    //   this.range.start = {
    //     line,
    //     unit,
    //   }
    //   unit += this.data.length;
    //   this.range.end = {
    //     line,
    //     unit
    //   }
    // }
    // else
    // {
    //   line = state.line;
    //   unit = state.unit;
    //   this.range.start = {
    //     line,
    //     unit
    //   }
      
    //   unit += this.data.length;
    //   this.range.end = {
    //     line,
    //     unit: unit
    //   }
    // }
    
    // if(this.trailingNewLine == true)
    // {
    //   unit = config.indentationLength * state.indent;
    //   line++;
    // }
    
    // let resultState = {
    //   ...state,
    //   line,
    //   unit
    // }
    
    return FormatResult.Ok;
  }
}