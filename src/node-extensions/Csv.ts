import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { format } from 'path';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';

type ICsvOpts = any

type This = PrivateNode<Ast.ICsv<Ast.TCsv>, ICsvOpts>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState({
    suppressInitialLineBreak: true
  });
  yield this.node.format(s, null, null, this.opts);
    
  if(this.maybeCommaConstant)
  {
    s = this.subState(this.node.outerRange.end);
    yield this.maybeCommaConstant.format(s);
  }
  
  this.setInnerRangeEnd(this.lastChild());
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.node;
  yield this.maybeCommaConstant;
}

const defaultOpts = {
  
}
export const CsvExtension: IPrivateNodeExtension = {
  _ext: "Csv",
  opts: {
    ...defaultOpts
  },
  respectsWhitespace: true,
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
