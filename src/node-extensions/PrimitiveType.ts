import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { format } from 'path';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';

type This = PrivateNode<Ast.PrimitiveType>;

function *_formatInline(this: This): FormatGenerator
{
  let end = this.state.unit + this.primitiveTypeKind.length;
  this.setInnerRangeEnd({
    line: this.state.line,
    unit: end
  });
  return end > this.config.lineWidth ? FormatResult.ExceedsLine : FormatResult.Ok;
}

function getContentString(this: This)
{
  return this.primitiveTypeKind;
}

export const PrimitiveTypeExtension: IPrivateNodeExtension = {
  _ext: "PrimitiveType",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  getContentString,
};
