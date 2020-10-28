import { Ast } from '@microsoft/powerquery-parser/lib/language';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';

type This = PrivateNode<Ast.LiteralExpression>;

function *_formatInline(this: This): FormatGenerator
{
  let end = this.state.unit + this.literal.length + this.wsBefore;
  this.setRangeEnd({
    unit: end
  });
  return end <= this.config.lineWidth ? FormatResult.Ok : FormatResult.ExceedsLine;
}

function getContentString(this: This)
{
  return this.literal;
}

export const LiteralExpressionExtension: IPrivateNodeExtension = {
  _ext: "LiteralExpression",
  respectsWhitespace: true,
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  getContentString,
};
