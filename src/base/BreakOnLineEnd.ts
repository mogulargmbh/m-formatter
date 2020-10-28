import { Optional } from '../interfaces';
import { IFormatterConfig } from '../main';
import { FormatResult, IFormatState, PrivateExtendedNode, retGen, NodeExtensionBase, IBaseNode, FormatNodeKind } from './Base';

export function format(this: PrivateExtendedNode, state: IFormatState, wsBefore: number = null, wsAfter: number = null, opts = null): FormatResult
{
  this.initFormat(state, wsBefore, wsAfter, opts);
  let res = this.formatLeadingComments()
  if(res == FormatResult.Break && this.state.stopOnLineBreak)
    return FormatResult.Break;
    
  this.setRangeStart();
  
  if(this.state.forceLineBreak != true)
  {
    for(let r of retGen(this._formatInline()))
    {
      res = r;
      if(res == FormatResult.ExceedsLine)
        break;
      if(res == FormatResult.Break && this.state.stopOnLineBreak == true)
        return res;
    }
  }
  
  if(res == FormatResult.Break)
    throw new Error("This should never happen"); //TODO: 
  
  if(res != FormatResult.Ok || this.state.forceLineBreak == true)
  {
    if(this.state.stopOnLineBreak == true)
      return FormatResult.Break;
    
    this.isBroken = true;
    res = this._formatBroken();
  }
  
  this.setRangeEnd(this.lastChild() ?? this.state);
  return res;
}

export function subState(this: PrivateExtendedNode, state: Optional<IFormatState> = null)
{
  let res = NodeExtensionBase.subState.call(this, state) as IFormatState;
  res.stopOnLineEnd = this.isBroken != true;
  return res;
}


export const BreakOnLineEndNodeBase: IBaseNode = {
  ...NodeExtensionBase,
  formatKind: FormatNodeKind.BreakOnLineEnd,
  format,
  subState
}