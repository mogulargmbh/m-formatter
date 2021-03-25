import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { FormatGenerator, FormatResult, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { Ast } from '../pq-ast';
import { NotSupported } from '../Util';

type This = PrivateNode<Ast.NotImplementedExpression>;

function *_formatInline(this: This): FormatGenerator
{
  yield this.ellipsisConstant.format(this.subState());
  this.setInnerRangeEnd(this.ellipsisConstant);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.ellipsisConstant;
}

export const NotImplementedExpressionExtension: IPrivateNodeExtension = {
  _ext: "NotImplementedExpression",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children
};
