import { FormatResult, IFormatState, PrivateExtendedNode, retGen, NodeExtensionBase, IBaseNode, FormatNodeKind } from './Base';
import { IFormatterConfig } from '../config/definitions';


function format(this: PrivateExtendedNode, state: IFormatState, wsBefore: number = null, wsAfter: number = null, opts = null): FormatResult
{
  this.initFormat(state, wsBefore, wsAfter, opts);
  let res = this.formatLeadingComments();
  if(res == FormatResult.Break && this.state.stopOnLineBreak)
    return FormatResult.Break;
    
  this.setRangeStart();
  
  for(let r of retGen(this._formatInline()))
  {
    res = r;
    if(res == FormatResult.Break && this.state.stopOnLineBreak)
      return res;
    if(res == FormatResult.ExceedsLine && this.state.stopOnLineEnd)
      return res;
  }
  
  if(this.range.end.line == null)
    throw new Error(`Forgot set range call for ${this._ext}`);
  //No set range call!
  
  return this.range.end.unit <= this.config.lineWidth ? FormatResult.Ok : FormatResult.ExceedsLine;
}

export const AlwaysInlineNodeBase: IBaseNode = {
  ...NodeExtensionBase,
  formatKind: FormatNodeKind.AlwaysInline,
  format
}