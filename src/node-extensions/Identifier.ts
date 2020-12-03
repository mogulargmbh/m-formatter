import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { IPrivateNodeExtension, ExtendedNode, IFormatState, FormatResult, FormatNodeKind, FormatGenerator } from '../base/Base';
import { NotSupported } from '../Util';

type This = ExtendedNode<Ast.Identifier | Ast.GeneralizedIdentifier>;

function *_formatInline(this: This): FormatGenerator
{
  let end = this.state.unit + this.literal.length;
  this.setInnerRangeEnd({
    line: this.state.line,
    unit: end
  });
  let res = end > this.config.lineWidth ? FormatResult.ExceedsLine : FormatResult.Ok;
  return res;
}

function getContentString(this: This)
{
  return this.literal;
}

export const IdentifierExtension: IPrivateNodeExtension = {
  _ext: "Identifier",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  getContentString,
};
