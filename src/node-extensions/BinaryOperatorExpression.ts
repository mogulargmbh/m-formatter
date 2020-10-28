import { Ast } from "../pq-ast";
import { IPrivateNodeExtension, ExtendedNode, FormatResult, FormatGenerator } from '../base/Base';
import { BreakOnLineEndNodeBase } from '../base/BreakOnLineEnd';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';

type BinaryExpression = Ast.EqualityExpression 
  | Ast.ArithmeticExpression
  | Ast.AsExpression 
  | Ast.EqualityExpression 
  | Ast.IsExpression 
  | Ast.LogicalExpression 
  | Ast.NullCoalescingExpression 
  | Ast.MetadataExpression 
  | Ast.RelationalExpression;
  

type This = ExtendedNode<BinaryExpression>;

function *_formatInline(this: This): FormatGenerator
{
  yield this.left.format(this.subState());
      
  yield this.operatorConstant.format(this.subState(this.left.range.end), 1, 1);
  
  yield this.right.format(this.subState(this.operatorConstant.range.end));
}

function _formatBroken(this: This): FormatResult
{
  this.left.format(this.subState({
    forceLineBreak: this.left._ext == "BinaryOperatorExpression" ? true : null,
  }));
  
  this.operatorConstant.format(this.subState({
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    line: this.left.range.end.line + 1
  }), 0, 1);
  
  let s = this.subState(this.operatorConstant.range.end);
  this.right.format(s); //No need for notify break as this node is breaking hence when state.notifyBreak is true this._formatBroken would nevre be called!
  return FormatResult.Break;
}

function *_children(this: This)
{
  yield this.left;
  yield this.operatorConstant;
  yield this.right;
}


export const BinaryOperatorExpressionExtension: IPrivateNodeExtension = {
  _ext: "BinaryOperatorExpression",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatInline,
  _formatBroken,
  _children,
};
