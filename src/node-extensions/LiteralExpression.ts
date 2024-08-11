import { Ast } from '../pq-ast';
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { FormatGenerator, FormatResult, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';
import { LiteralKind } from '@microsoft/powerquery-parser/lib/powerquery-parser/language/ast/ast';

type This = PrivateNode<Ast.LiteralExpression>;

const lfRegex = /#\(lf\)/g;

function *_formatInline(this: This): FormatGenerator
{
  if(this.config.replaceLfInStrings && this.literalKind == LiteralKind.Text && this.literal.includes("#(lf)"))
  {
    let lines = this.literal.split(lfRegex);
    this.setInnerRangeEnd({
      line: this.state.line,
      unit: this.currIndentUnit() + lines[lines.length-1].length
    });
    return FormatResult.Break;
  }
    
  let end = this.state.unit + this.literal.length + this.wsBefore;
  this.setInnerRangeEnd({
    line: this.state.line,
    unit: end
  });
  return end <= this.config.lineWidth ? FormatResult.Ok : FormatResult.ExceedsLine;
}

function getContentString(this: This)
{
  if(this.config.replaceLfInStrings && this.literalKind == LiteralKind.Text && this.literal.includes("#(lf)"))
  {
    let lines = this.literal.split(lfRegex);
    return [
      lines[0],
      ...lines.slice(1).map(e => " ".repeat(this.currIndentUnit()) + e)
    ].join("\n")
  }
  return this.literal;
}

export const LiteralExpressionExtension: IPrivateNodeExtension = {
  _ext: "LiteralExpression",
  respectsWhitespace: true,
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  getContentString,
};
