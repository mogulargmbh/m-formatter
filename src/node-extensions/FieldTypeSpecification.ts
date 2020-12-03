import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';

type NodeType = Ast.FieldTypeSpecification;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.equalConstant.format(s, 1, 1);
  
  s = this.subState(this.equalConstant.outerRange.end);
  yield this.fieldType.format(s);
    
  this.setInnerRangeEnd(this.fieldType);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.equalConstant;
  yield this.fieldType;
}

export const FieldTypeSpecificationExtension: IPrivateNodeExtension = {
  _ext: "FieldTypeSpecification",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
