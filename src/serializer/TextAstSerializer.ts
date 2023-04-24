import { ExtendedNode } from '../base/Base';
import { ITextAstSerializerConfig } from '../config/definitions';
import { BaseAstSerializer } from './BaseAstSerializer';
import { defaultTextSerializerConfig } from '../config/default';
import { ExtendedComment } from '../CommentExtension';
import { CommentKind } from '../pq-ast';

export type WritableTokenPosition = {
  lineNumber: number,
  lineCodeUnit: number;
}

export class TextAstSerializer extends BaseAstSerializer<WritableTokenPosition, ITextAstSerializerConfig>
{
  constructor()
  {
    super(defaultTextSerializerConfig)
  }
  
  visitComment(c: ExtendedComment): string
  {
    let result = this.moveCursor(c.positionStart);
    if(c.kind == CommentKind.Multiline && c.lines.length > 1)
    {
      c.lines.forEach((l,i,a) => {
        result += l;
        if(i < a.length - 1)
        {
          result += this.config.lineEnd
          this.state.lineNumber += 1;
        }
      });
      this.state.lineCodeUnit = c.lines.last().length;
    }
    else
    {
      result += c.data;
      this.state.lineCodeUnit += c.data.length;
    }
    result += this.moveCursor(c.positionEnd);
    return result;
  }
  
  visit(n: ExtendedNode): string
  {
    let result = "";
    
    if(n.config.includeComments == true)
    {
      for(let c of n.leadingComments)
      {
        result += this.visitComment(c);
      }
    }
    result += this.moveCursor(n.tokenRange.positionStart);
    
    if(n.isLeaf === true)
    {
      let content = n.getContentString();
      result += content;
      this.state.lineCodeUnit += content.length;
    }
    else
    {
      for(let c of n.children)
      {
        result += this.visit(c); 
      }
    }
    
    result += this.moveCursor(n.tokenRange.positionEnd);
    if(n.config.includeComments == true)
    {
      for(let c of n.trailingComments)
      {
        result += this.visitComment(c);
      }
    }
    
    return result;
  }
  
  protected _serialize(n: ExtendedNode): string
  {
    return this.visit(n);
  }
  
  convertIndentation(code: string, ws: string, indentationLength: number, newIndentationString: string)
  {
    return code
      .split(/\n/g)
      .map(l => l.replace(new RegExp(`^([ \u00A0]+)`, "g"), (s,g) => {
        let len = g.length;
        let rest = len % indentationLength;
        return newIndentationString.repeat(Math.floor(len / indentationLength)) + ws.repeat(rest);
      }))
      .join("\n");
  }
  
}
