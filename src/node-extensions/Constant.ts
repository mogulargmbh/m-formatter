import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { IPrivateNodeExtension, PrivateNode, FormatResult, FormatGenerator } from '../base/Base';
import { NotSupported } from '../Util';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';

type This = PrivateNode<TConstant>;

function *_formatInline(this: This): FormatGenerator
{
  this.setRangeEnd({
    unit: this.state.unit + this.constantKind.length + this.wsBefore
  });
  return this.range.end.unit > this.config.lineWidth ? FormatResult.ExceedsLine : FormatResult.Ok;
}

function getContentString(this: This)
{
  return this.constantKind;
}

export const ConstantExtension: IPrivateNodeExtension = {
  _ext: "Constant",
  respectsWhitespace: true,
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  getContentString,
};
