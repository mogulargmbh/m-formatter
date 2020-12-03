import { Optional } from '../interfaces';
import { FormatResult, IFormatState, PrivateExtendedNode, retGen, NodeExtensionBase, IBaseNode, FormatNodeKind } from './Base';
import { IFormatterConfig } from '../config/definitions';

export function format(this: PrivateExtendedNode, state: IFormatState, wsBefore: number = null, wsAfter: number = null, opts = null): FormatResult
{
  this.initFormat(state, wsBefore, wsAfter, opts);
  this.setRangeStart();
  
  let [res, s] = this.formatLeadingComments();
  this.state = s;
  if(res == FormatResult.Break && this.state.stopOnLineBreak == true)
    return FormatResult.Break;
  this.setRangeStart();
    
  
  if(this.state.forceLineBreak != true)
  {
    for(let r of retGen(this._formatInline()))
    {
      res = r;
      if(res == FormatResult.ExceedsLine)
        break;
      if(res == FormatResult.Break)
        break;
    }
  }
  
  if(res != FormatResult.Ok || this.state.forceLineBreak == true)
  {
    if(this.state.stopOnLineBreak == true)
      return FormatResult.Break;
      
    this.isBroken = true;
    res = this._formatBroken();
  }
  
  this.setRangeEnd(this.lastChild() ?? this.state);
  
  if(this.trailingComments?.any())
  {
    let [res2, s2] = this.formatTrailingComments();
    if(res2 == FormatResult.Break && this.state.stopOnLineBreak)
      return FormatResult.Break;
  }
  
  this.finishFormat();
  return res;
}

export function subState(this: PrivateExtendedNode, state: Optional<IFormatState> = null)
{
  let res = NodeExtensionBase.subState.call(this, state) as IFormatState;
  res.stopOnLineBreak = this.isBroken != true;
  res.stopOnLineEnd = this.isBroken != true;
  return res;
}


export const BreakOnAnyChildBrokenNodeBase: IBaseNode = {
  ...NodeExtensionBase,
  formatKind: FormatNodeKind.BreakOnAnyChildBroken,
  format,
  subState
}