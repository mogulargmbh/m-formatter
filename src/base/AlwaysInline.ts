import { FormatResult, IFormatState, PrivateExtendedNode, retGen, NodeExtensionBase, IBaseNode, FormatNodeKind } from './Base';
import { IFormatterConfig } from '../config/definitions';


function format(this: PrivateExtendedNode, state: IFormatState, wsBefore: number = null, wsAfter: number = null, opts = null): FormatResult
{
  this.initFormat(state, wsBefore, wsAfter, opts);
  this.setRangeStart();
  
  let [res, s] = this.formatLeadingComments();
  this.state = s;
  
  if(res == FormatResult.Break && this.state.stopOnLineBreak)
  return FormatResult.Break;
  
  for(let r of retGen(this._formatInline()))
  {
    res = r;
    if(res == FormatResult.Break && this.state.stopOnLineBreak)
      return res;
    if(res == FormatResult.ExceedsLine && this.state.stopOnLineEnd)
      return res;
  }
  
  //No set range call -> check if forgotten
  if(this.range.end.line == null)
    throw new Error(`Forgot set range call for ${this._ext}`);
  
  if(this.trailingComments.any())
  {
    let [res2, s2] = this.formatTrailingComments();
    this.setRangeEnd(s2);
  }
  
  this.finishFormat();
  return this.range.end.unit <= this.config.lineWidth ? FormatResult.Ok : FormatResult.ExceedsLine;
}

export const AlwaysInlineNodeBase: IBaseNode = {
  ...NodeExtensionBase,
  formatKind: FormatNodeKind.AlwaysInline,
  format
}