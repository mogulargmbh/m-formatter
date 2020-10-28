import { Ast } from '@microsoft/powerquery-parser/lib/language';
import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';

type This = PrivateNode<Ast.NotImplementedExpression>;

function *_formatInline(this: This): FormatGenerator
{
  yield this.ellipsisConstant.format(this.subState());
  this.setRangeEnd(this.ellipsisConstant);
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
