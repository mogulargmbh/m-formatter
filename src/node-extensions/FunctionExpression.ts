import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { NotSupported } from '../Util';
import { BinaryExpression } from './BinaryOperatorExpression';

type NodeType = Ast.FunctionExpression
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.parameters.format(s);
  
  s = this.subState(this.parameters.outerRange.end);
  if(this.maybeFunctionReturnType)
  {
    yield this.maybeFunctionReturnType.format(s)
    s = this.subState(this.maybeFunctionReturnType.outerRange.end);
  }
  
  yield this.fatArrowConstant.format(s, 1, 1);
  
  s = this.subState(this.fatArrowConstant.outerRange.end);
  yield this.expression.format(s)
  
  return FormatResult.Ok;
}

function getNextNode(node: ExtendedNode): ExtendedNode
{
  let n = node;
  while(n && n._ext == "BinaryOperatorExpression")
  {
    n = (n as ExtendedNode<BinaryExpression>).left;
  }
  return n;
}

const bracedNodes = [
  "BracedArrayWrapper",
  "BracedArrayWrapperOptional",
  "BracedWrapper"
]

function _formatBroken(this: This): FormatResult
{
  let s = this.subState();
  this.parameters.format(s);
  
  s = this.subState(this.parameters.outerRange.end);
  if(this.maybeFunctionReturnType)
  {
    this.maybeFunctionReturnType.format(s);
    s = this.subState(this.maybeFunctionReturnType.outerRange.end);
  }
  
  this.fatArrowConstant.format(s, 1, 0);
  
  s = this.subState({
    line:  this.fatArrowConstant.outerRange.end.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    suppressInitialLineBreak: true
  });
  this.expression.format(s);
  
  let nextNodeExt = getNextNode(this.expression)._ext;
  if(bracedNodes.contains(nextNodeExt) && this.expression.isBroken) //Pack braced nodes in the same line
  {
    s = this.subState({
      line: this.fatArrowConstant.outerRange.end.line,
      unit: this.fatArrowConstant.outerRange.end.unit + 1,
      indent: this.state.indent,
      suppressInitialLineBreak: true
    });
    this.expression.format(s);

  }
  
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
