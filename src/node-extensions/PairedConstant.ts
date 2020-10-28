import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { NotSupported } from '../Util';
import { BreakOnLineEndNodeBase } from '../base/BreakOnLineEnd';

type NodeType = Ast.TPairedConstant;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.constant.format(s, 0, 1);
  
  s = this.subState(this.constant.range.end);
  yield this.paired.format(s);
  
  return FormatResult.Ok;
}

function _formatBroken(this: This)
{
  this.constant.format(this.subState());
  
  this.paired.format(this.subState({
    line: this.constant.range.end.line + 1,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1
  }));
  
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.constant;
  yield this.paired;
}

export const PairedConstantExtension: IPrivateNodeExtension = {
  _ext: "PairedConstant",
  respectsWhitespace: true,
  ...BreakOnLineEndNodeBase,
  _formatInline,
  _formatBroken,
  _children,
};
