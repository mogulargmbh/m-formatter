import { ExtendedNode } from '../base/Base';
import { ITextAstSerializerConfig } from '../config/definitions';
import { BaseAstSerializer } from './BaseAstSerializer';
import { defaultTextSerializerConfig } from '../config/default';
import { ExtendedComment } from '../CommentExtension';

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
    let result = c.data;
    this.state.lineCodeUnit += c.data.length;
    result += this.moveCursor(c.positionEnd);
    return result;
  }
  
  visit(n: ExtendedNode): string
  {
    let result = "";
    result += this.moveCursor(n.tokenRange.positionStart);
    
    for(let c of n.leadingComments)
    {
      result += this.visitComment(c);
    }
    
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
    
    for(let c of n.trailingComments)
    {
      result += this.visitComment(c);
    }
    
    result += this.moveCursor(n.tokenRange.positionEnd);
    
    return result;
  }
  
  _serialize(n: ExtendedNode): string
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
