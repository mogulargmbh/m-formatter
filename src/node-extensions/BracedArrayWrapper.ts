import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { ICsvArray } from "@microsoft/powerquery-parser/lib/powerquery-parser/language/ast/ast";
import { isBracketNode, getBracketsWsInline, getBracketWsBroken } from '../Util';

type NodeType = Ast.ListExpression
  | Ast.IParameterList<Ast.TParameterType> 
  | Ast.InvokeExpression
  | Ast.ListExpression
  | Ast.ListLiteral 
  | Ast.RecordExpression
  | Ast.RecordLiteral;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let ws = getBracketsWsInline(this);
  
  yield this.openWrapperConstant.format(this.subState(), ws.openBefore, ws.openAfter);
  
  let s = this.subState(this.openWrapperConstant.outerRange.end);
  yield this.content.format(s);
  
  s = this.subState(this.content.outerRange.end);
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
  
  this.closeWrapperConstant.format(this.subState({
    line: this.content.outerRange.end.line + 1,
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

export const BracedArrayWrapperExtension: IPrivateNodeExtension = {
  _ext: "BracedArrayWrapper",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
