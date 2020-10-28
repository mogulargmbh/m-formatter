import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';

type NodeType = Ast.IfExpression
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.ifConstant.format(s, 0, 1);
  
  s = this.subState(this.ifConstant.range.end);
  yield this.condition.format(s);
  
  s = this.subState(this.condition.range.end);
  yield this.thenConstant.format(s, 1, 1);
  
  s = this.subState(this.thenConstant.range.end);
  yield this.trueExpression.format(s);
  
  s = this.subState(this.trueExpression.range.end);
  yield this.elseConstant.format(s, 1, 1);
  
  s = this.subState(this.elseConstant.range.end);
  yield this.falseExpression.format(s);
  
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  this.setRangeStart();
  
  let { line, unit, indent } = this.state;
  let s = this.subState();
  if(this.state.suppressInitialLineBreak == true)
  {
    this.ifConstant.format(this.subState(), 0, 1);
    line += 1;
  }
  else
  {
    indent += 1
    this.ifConstant.format(this.subState({
      unit: this.indentUnit(indent),
      line: line + 1,
      indent
    }), 0, 1);
    line += 2;
    unit = this.nextIndentUnit();
  }
  
  s = this.subState(this.ifConstant.range.end);
  this.condition.format(s);
  
  s = this.subState(this.condition.range.end);
  this.thenConstant.format(s, 1, 0);
  
  s = this.subState({
    line: this.thenConstant.range.end.line + 1,
    indent: indent + 1,
    unit: this.indentUnit(indent + 1)
  });
  this.trueExpression.format(s);
  
  s = this.subState({
    line: this.trueExpression.range.end.line + 1,
    unit: this.indentUnit(indent)
  });
  this.elseConstant.format(s);
  
  if(this.falseExpression.kind == Ast.NodeKind.IfExpression)
  {
    s = this.subState({
      ...this.elseConstant.range.end,
      suppressInitialLineBreak: true,
      indent: indent,
    });
    s.unit += 1;
  }
  else
  {
    s = this.subState({
      line: this.elseConstant.range.end.line + 1,
      indent: indent + 1,
      unit: this.indentUnit(indent + 1),
      forceLineBreak: true,
    });
  }
  this.falseExpression.format(s);
  
  this.setRangeEnd(this.falseExpression);
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.ifConstant;
  yield this.condition;
  yield this.thenConstant;
  yield this.trueExpression;
  yield this.elseConstant;
  yield this.falseExpression
}

export const IfExpressionExtension: IPrivateNodeExtension = {
  _ext: "IfExpression",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
