import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { NotSupported } from '../Util';

type NodeType = Ast.FunctionExpression
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.parameters.format(s);
  
  s = this.subState(this.parameters.range.end);
  if(this.maybeFunctionReturnType)
  {
    yield this.maybeFunctionReturnType.format(s)
    s = this.subState(this.maybeFunctionReturnType.range.end);
  }
  
  yield this.fatArrowConstant.format(s, 1, 1);
  
  s = this.subState(this.fatArrowConstant.range.end);
  yield this.expression.format(s)
  
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  let s = this.subState();
  this.parameters.format(s);
  
  s = this.subState(this.parameters.range.end);
  if(this.maybeFunctionReturnType)
  {
    this.maybeFunctionReturnType.format(s);
    s = this.subState(this.maybeFunctionReturnType.range.end);
  }
  
  this.fatArrowConstant.format(s, 1, 0);
  
  s = this.subState({
    line: this.fatArrowConstant.range.end.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    suppressInitialLineBreak: true
  });
  this.expression.format(s);
  
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.parameters;
  yield this.maybeFunctionReturnType;
  yield this.fatArrowConstant;
  yield this.expression;
}

export const FunctionExpressionExtension: IPrivateNodeExtension = {
  _ext: "FunctionExpression",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
