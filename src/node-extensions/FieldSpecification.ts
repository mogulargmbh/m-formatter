import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.FieldSpecification;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.name.format(s);
  
  let end = this.name.outerRange.end;
  if(this.optionalConstant)
  {
    s = this.subState(this.name.outerRange.end);
    yield this.optionalConstant.format(s)
    end = this.optionalConstant.outerRange.end;
  }
  if(this.fieldTypeSpecification)
  {
    let s = this.subState(end);
    yield this.fieldTypeSpecification.format(s);
  }
  
  this.setInnerRangeEnd(this.lastChild())
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.name;
  yield this.optionalConstant;
  yield this.fieldTypeSpecification;
}

export const FieldSpecificationExtension: IPrivateNodeExtension = {
  _ext: "FieldSpecification",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
