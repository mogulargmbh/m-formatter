import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
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
  if(this.maybeOptionalConstant)
  {
    s = this.subState(this.name.outerRange.end);
    yield this.maybeOptionalConstant.format(s)
    end = this.maybeOptionalConstant.outerRange.end;
  }
  if(this.maybeFieldTypeSpecification)
  {
    let s = this.subState(end);
    yield this.maybeFieldTypeSpecification.format(s);
  }
  
  this.setInnerRangeEnd(this.lastChild())
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.name;
  yield this.maybeOptionalConstant;
  yield this.maybeFieldTypeSpecification;
}

export const FieldSpecificationExtension: IPrivateNodeExtension = {
  _ext: "FieldSpecification",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
