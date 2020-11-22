import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { NotSupported } from '../Util';

type NodeType = Ast.ParenthesizedExpression;
  
type This = ExtendedNode<NodeType>;

//TODO: review

function *_formatInline(this: This): FormatGenerator
{
  yield this.openWrapperConstant.format(this.subState());
  
  let s = this.subState(this.openWrapperConstant.range.end);
  yield this.content.format(s);
  
  s = this.subState(this.content.range.end);
  yield this.closeWrapperConstant.format(s);
    
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  this.openWrapperConstant.format(this.subState());
  
  let s = this.subState({
    line: this.state.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    suppressInitialLineBreak: true
  });
  
  this.content.format(s);
  
  this.closeWrapperConstant.format(this.subState({
    line: this.content.range.end.line + 1,
    unit: this.currIndentUnit(),
    indent: this.state.indent
  }));
  
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.openWrapperConstant;
  yield this.content;
  yield this.closeWrapperConstant;
}

export const BracedWrapperExtension: IPrivateNodeExtension = {
  _ext: "BracedWrapper",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
