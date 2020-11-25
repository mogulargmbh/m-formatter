import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';

type NodeType = Ast.FieldSpecificationList;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  yield this.openWrapperConstant.format(this.subState());
  
  let s = this.subState(this.openWrapperConstant.range.end);
  yield this.content.format(s);
  
  s = this.subState(this.content.range.end);
  if(this.maybeOpenRecordMarkerConstant)
  {
    s.unit += 1;
    yield this.maybeOpenRecordMarkerConstant.format(s)
    s = this.subState(this.maybeOpenRecordMarkerConstant.range.end);
  }
  
  yield this.closeWrapperConstant.format(s);
    
  return FormatResult.Ok;
}

function _formatBroken(this: This)
{
  this.openWrapperConstant.format(this.subState());
  
  let s = this.subState({
    line: this.state.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    suppressInitialLineBreak: true,
    forceLineBreak: true
  });
  
  this.content.format(s);
  
  let line = this.content.range.end.line;
  if(this.maybeOpenRecordMarkerConstant)
  {
    this.maybeOpenRecordMarkerConstant.format(
      this.subState({
        line: this.content.range.end.line + 1,
        unit: this.nextIndentUnit(),
        indent: this.state.indent + 1
      })
    );
    line = this.maybeOpenRecordMarkerConstant.range.end.line;
  }
  
  this.closeWrapperConstant.format(this.subState({
    line: line + 1,
    unit: this.currIndentUnit(),
    indent: this.state.indent
  }));
  
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.openWrapperConstant;
  yield this.content;
  yield this.maybeOpenRecordMarkerConstant;
  yield this.closeWrapperConstant;
}

export const FieldSpecificationListExtension: IPrivateNodeExtension = {
  _ext: "FieldSpecificationList",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
