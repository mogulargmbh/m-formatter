import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { NotSupported } from '../Util';

type NodeType = Ast.FieldSelector
  | Ast.ItemAccessExpression;
  
type This = ExtendedNode<NodeType>;

//TODO: review

function *_formatInline(this: This): FormatGenerator
{
  yield this.openWrapperConstant.format(this.subState());
  
  let s = this.subState(this.openWrapperConstant.outerRange.end);
  yield this.content.format(s);
  
  s = this.subState(this.content.outerRange.end);
  yield this.closeWrapperConstant.format(s);
  
  if(this.maybeOptionalConstant)
  {
    s = this.subState(this.closeWrapperConstant.outerRange.end);
    yield this.maybeOptionalConstant.format(s);
  }
    
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  this.openWrapperConstant.format(this.subState());
  
  let s = this.subState({
    line: this.state.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1
  });
  
  this.content.format(s);
  
  s = this.subState({
    line: this.content.outerRange.end.line + 1,
    unit: this.currIndentUnit(),
    indent: this.state.indent
  });
  this.closeWrapperConstant.format(s);
  
  if(this.maybeOptionalConstant)
  {
    s = this.subState(this.closeWrapperConstant.outerRange.end);
    this.maybeOptionalConstant.format(s);
  }
  
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.openWrapperConstant;
  yield this.content;
  yield this.closeWrapperConstant;
  if(this.maybeOptionalConstant)
    yield this.maybeOptionalConstant;
}

export const BracedWrapperOptionalExtension: IPrivateNodeExtension = {
  _ext: "BracedWrapperOptional",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
