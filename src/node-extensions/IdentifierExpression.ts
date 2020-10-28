import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type This = ExtendedNode<Ast.IdentifierExpression>;

function *_formatInline(this: This): FormatGenerator
{
  let end = this.subState();
  if(this.maybeInclusiveConstant)
  {
    yield this.maybeInclusiveConstant.format(this.subState());
    end = this.subState(this.maybeInclusiveConstant.range.end);
  }
  yield this.identifier.format(end);
  this.setRangeEnd(this.identifier);
}

function *_children(this: This)
{
  yield this.maybeInclusiveConstant;
  yield this.identifier;
}

export const IdentifierExpressionExtension: IPrivateNodeExtension = {
  _ext: "IdentifierExpression",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
