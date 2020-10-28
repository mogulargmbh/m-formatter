import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnLineEndNodeBase } from '../base/BreakOnLineEnd';
import { NotSupported } from '../Util';

type BinaryExpression = Ast.RangeExpression

type This = ExtendedNode<BinaryExpression>;

function *_formatInline(this: This): FormatGenerator
{
  yield this.left.format(this.subState());
      
  yield this.rangeConstant.format(this.subState(this.left.range.end), 1, 1);
  
  yield this.right.format(this.subState(this.rangeConstant.range.end));
    
  return FormatResult.Ok;
}

function _formatBroken(this: This)
{
  this.left.format(this.subState());
  
  this.rangeConstant.format(this.subState({
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    line: this.state.line + 1
  }), 0, 1);
  
  this.right.format(this.subState(this.rangeConstant.range.end)); //No need for notify break as this node is breaking hence when state.notifyBreak is true this._formatBroken would nevre be called!
  
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.left;
  yield this.rangeConstant;
  yield this.right;
}

export const RangeExpressionExtension: IPrivateNodeExtension = {
  _ext: "RangeExpression",
  ...BreakOnLineEndNodeBase,
  _formatInline,
  _formatBroken,
  _children,
};
