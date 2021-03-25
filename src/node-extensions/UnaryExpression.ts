import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatResult, IPrivateNodeExtension } from '../base/Base';
import { BreakOnLineEndNodeBase } from '../base/BreakOnLineEnd';
import { IArrayWrapperOpts } from './ArrayWrapper';

type This = ExtendedNode<Ast.UnaryExpression>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.operators.format(s, null, null, {
    inlineWsAfter: (n,i,l) => 1
  } as IArrayWrapperOpts);
  
  s = this.subState(this.operators.outerRange.end);
  yield this.typeExpression.format(s);
      
  return FormatResult.Ok;
}

function _formatBroken(this: This)
{
  let s = this.subState({
    line: this.state.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1
  });
  this.operators.format(this.subState(s));
  
  s = this.subState(this.operators.outerRange.end);
  this.typeExpression.format(this.subState(s));
  
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.operators;
  yield this.typeExpression;
}

export const UnaryExpressionExtension: IPrivateNodeExtension = {
  _ext: "UnaryExpression",
  ...BreakOnLineEndNodeBase,
  _formatInline,
  _formatBroken,
  _children,
};
