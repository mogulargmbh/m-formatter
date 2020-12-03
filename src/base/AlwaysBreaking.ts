import { IFormatterConfig } from '../main';
import { FormatResult, IFormatState, PrivateExtendedNode, NodeExtensionBase, IBaseNode, FormatNodeKind } from './Base';

export function format(this: PrivateExtendedNode, state: IFormatState, wsBefore: number = null, wsAfter: number = null, opts): FormatResult
{
  this.initFormat(state, wsBefore, wsAfter, opts);
  this.setOuterRangeStart(); 
  
  let [res, s] = this.formatLeadingComments();
  this.state = s;
  this.setInnerRangeStart(s);

  if(res == FormatResult.Break && this.state.stopOnLineBreak)
    return FormatResult.Break;
  
  if(this.state.stopOnLineBreak)
    return FormatResult.Break;
  
  this.isBroken = true;
  
  res = this._formatBroken();
  
  let endCursor = this.lastChild() ?? this.state;
  this.setInnerRangeEnd(endCursor);
  
  if(this.trailingComments?.any())
  {
    let [res2, s2] = this.formatTrailingComments();
    endCursor = s2;
    if(res2 == FormatResult.Break && this.state.stopOnLineBreak)
      return FormatResult.Break;
  }
  this.setOuterRangeEnd(endCursor);
  
  this.finishFormat();
  return FormatResult.Ok;
}

export const AlwaysBreakingNodeBase: IBaseNode = {
  ...NodeExtensionBase,
  formatKind: FormatNodeKind.AlwaysBreaking,
  format
}
