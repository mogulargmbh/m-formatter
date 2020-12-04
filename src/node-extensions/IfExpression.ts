import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';

type NodeType = Ast.IfExpression
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.ifConstant.format(s, 0, 1);
  
  s = this.subState(this.ifConstant.outerRange.end);
  yield this.condition.format(s);
  
  s = this.subState(this.condition.outerRange.end);
  yield this.thenConstant.format(s, 1, 1);
  
  s = this.subState(this.thenConstant.outerRange.end);
  yield this.trueExpression.format(s);
  
  s = this.subState(this.trueExpression.outerRange.end);
  yield this.elseConstant.format(s, 1, 1);
  
  s = this.subState(this.elseConstant.outerRange.end);
  yield this.falseExpression.format(s);
  
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  this.setOuterRangeStart();
  
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
  
  s = this.subState({
    ...this.ifConstant.outerRange.end,
    indent: indent
  });
  
  this.condition.format(s);
  let wsBefore; 
  if(this.condition.outerRange.end.line != this.ifConstant.outerRange.end.line) //TODO SqlODBC.pq if condition breaks does that look best?
  {
    s = this.subState({
      line: this.condition.outerRange.end.line + 1,
      indent: indent,
      unit: this.indentUnit(indent)
    });
    wsBefore = 0;
  }
  else
  {
    s = this.subState(this.condition.outerRange.end);
    wsBefore = 1;
  }
  
  this.thenConstant.format(s, wsBefore, 0);
  
  s = this.subState({
    line: this.thenConstant.outerRange.end.line + 1,
    indent: indent + 1,
    unit: this.indentUnit(indent + 1),
    suppressInitialLineBreak: true
  });
  this.trueExpression.format(s);
  
  s = this.subState({
    line: this.trueExpression.outerRange.end.line + 1,
    unit: this.indentUnit(indent)
  });
  this.elseConstant.format(s);
  
  if(this.falseExpression.kind == Ast.NodeKind.IfExpression)
  {
    s = this.subState({
      ...this.elseConstant.outerRange.end,
      suppressInitialLineBreak: true,
      indent: indent,
    });
    s.unit += 1;
  }
  else
  {
    s = this.subState({
      line: this.elseConstant.outerRange.end.line + 1,
      indent: indent + 1,
      unit: this.indentUnit(indent + 1),
      suppressInitialLineBreak: true
    });
  }
  this.falseExpression.format(s);
  
  this.setOuterRangeEnd(this.falseExpression);
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
