import { Ast } from "../pq-ast";
import { ExtendedNode, FormatResult, FormatGenerator, IPrivateNodeExtension } from '../base/Base';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { NotSupported } from '../Util';

type NodeType = Ast.AsType 
  | Ast.NullablePrimitiveType
  | Ast.NullableType
  | Ast.AsNullablePrimitiveType
  | Ast.TypePrimaryType;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let wsBefore = 0;
  if(this.kind == Ast.NodeKind.AsNullablePrimitiveType || this.kind == Ast.NodeKind.AsType)
    wsBefore = 1;
  yield this.constant.format(this.subState(), wsBefore, 1);
  
  let s = this.subState(this.constant.outerRange.end);
  yield this.paired.format(s);
  
  this.setInnerRangeEnd(this.paired);
  return FormatResult.Ok;
}

// function _formatBroken(this: This): FormatResult
// {
//   this.setRangeStart();
  
//   this.constant.format(this.subState());
  
//   this.paired.format(this.subState({
//     unit: this.nextIndentUnit(),
//     line: this.state.line + 1,
//     indent: this.state.indent + 1
//   }));
  
//   this.setRangeEnd(this.paired);
//   return FormatResult.Ok;
// }

function *_children(this: This)
{
  yield this.constant;
  yield this.paired;
}

export const BaseTypeExtension: IPrivateNodeExtension = {
  _ext: "BaseType",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
