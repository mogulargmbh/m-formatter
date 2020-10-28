import { IFormatterConfig } from '../main';
import { FormatResult, IFormatState, PrivateExtendedNode, NodeExtensionBase, IBaseNode, FormatNodeKind } from './Base';

export function format(this: PrivateExtendedNode, state: IFormatState, wsBefore: number = null, wsAfter: number = null, opts): FormatResult
{
  this.initFormat(state, wsBefore, wsAfter, opts);
  let res = this.formatLeadingComments();
  if(res == FormatResult.Break && this.state.stopOnLineBreak)
    return FormatResult.Break;
  
  if(this.state.stopOnLineBreak)
    return FormatResult.Break;
  
  this.isBroken = true;
  this.setRangeStart();
  
  res = this._formatBroken();
  
  this.setRangeEnd(this.children?.last() ?? this.state);
  return FormatResult.Ok;
}

export const AlwaysBreakingNodeBase: IBaseNode = {
  ...NodeExtensionBase,
  formatKind: FormatNodeKind.AlwaysBreaking,
  format
}
