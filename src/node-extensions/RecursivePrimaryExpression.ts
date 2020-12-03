import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type PairedExpression = Ast.RecursivePrimaryExpression;
  
type This = ExtendedNode<PairedExpression>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.head.format(s);
  
  s = this.subState(this.head.outerRange.end);
  yield this.recursiveExpressions.format(s);
    
  this.setInnerRangeEnd(this.recursiveExpressions);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.head;
  yield this.recursiveExpressions;
}

export const RecursivePrimaryExpressionExtension: IPrivateNodeExtension = {
  _ext: "RecursivePrimaryExpression",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
