import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { getBracketsWsInline, getBracketWsBroken } from '../Util';

type NodeType = Ast.FieldSpecificationList;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let ws = getBracketsWsInline(this);
  
  yield this.openWrapperConstant.format(this.subState(), ws.openBefore, ws.openAfter);
  
  let s = this.subState(this.openWrapperConstant.outerRange.end);
  yield this.content.format(s);
  
  s = this.subState(this.content.outerRange.end);
  if(this.maybeOpenRecordMarkerConstant)
  {
    s.unit += 1;
    yield this.maybeOpenRecordMarkerConstant.format(s)
    s = this.subState(this.maybeOpenRecordMarkerConstant.outerRange.end);
  }
  
  yield this.closeWrapperConstant.format(s, ws.closeBefore, ws.closeAfter);
    
  return FormatResult.Ok;
}

function _formatBroken(this: This)
{
  let ws = getBracketWsBroken(this);
  this.openWrapperConstant.format(this.subState(), ws);
  
  let s = this.subState({
    line: this.state.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
    suppressInitialLineBreak: true,
    forceLineBreak: true
  });
  
  this.content.format(s);
  
  let line = this.content.outerRange.end.line;
  if(this.maybeOpenRecordMarkerConstant)
  {
    this.maybeOpenRecordMarkerConstant.format(
      this.subState({
        line: this.content.outerRange.end.line + 1,
        unit: this.nextIndentUnit(),
        indent: this.state.indent + 1
      })
    );
    line = this.maybeOpenRecordMarkerConstant.outerRange.end.line;
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
