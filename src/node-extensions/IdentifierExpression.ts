import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type This = ExtendedNode<Ast.IdentifierExpression>;

function *_formatInline(this: This): FormatGenerator
{
  let end = this.subState();
  if(this.inclusiveConstant)
  {
    yield this.inclusiveConstant.format(this.subState());
    end = this.subState(this.inclusiveConstant.outerRange.end);
  }
  yield this.identifier.format(end);
  this.setInnerRangeEnd(this.identifier);
}

function *_children(this: This)
{
  yield this.inclusiveConstant;
  yield this.identifier;
}

export const IdentifierExpressionExtension: IPrivateNodeExtension = {
  _ext: "IdentifierExpression",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
