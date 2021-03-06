import { Ast } from '../pq-ast';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { FormatGenerator, FormatResult, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';

type This = PrivateNode<Ast.LiteralExpression>;

function *_formatInline(this: This): FormatGenerator
{
  let end = this.state.unit + this.literal.length + this.wsBefore;
  this.setInnerRangeEnd({
    line: this.state.line,
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
