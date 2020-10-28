import { ExtendedNode } from '../base/Base';
import { ITextAstSerializerConfig } from '../config/definitions';
import { BaseAstSerializer } from './BaseAstSerializer';
import { defaultTextSerializerConfig } from '../config/default';

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
  visit(n: ExtendedNode): string
  {
    let result = "";
    for(let c of n.leadingComments)
    {
      result += this.moveCursor(c.positionStart);
      result += c.text;
      result += this.moveCursor(c.positionEnd);
    }
    
    result = this.moveCursor(n.tokenRange.positionStart);
    
    if(n.isLeaf === true)
    {
      result += n.getContentString();
      this.state.lineNumber = n.tokenRange.positionEnd.lineNumber;
      this.state.lineCodeUnit = n.tokenRange.positionEnd.lineCodeUnit;
    }
    else
    {
      for(let c of n.children)
      {
        result += this.visit(c); 
      }
      
      result += this.moveCursor(n.tokenRange.positionEnd);
    }
    
    return result;
  }
  
}
