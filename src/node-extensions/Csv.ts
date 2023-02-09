import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { NotSupported } from '../Util';

type ICsvOpts = any

type This = PrivateNode<Ast.ICsv<Ast.TCsv>, ICsvOpts>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState({
    suppressInitialLineBreak: true
  });
  yield this.node.format(s, null, null, this.opts);
    
  if(this.commaConstant)
  {
    s = this.subState(this.node.outerRange.end);
    yield this.commaConstant.format(s, 0, 1);
  }
  
  this.setInnerRangeEnd(this.lastChild());
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.node;
  yield this.commaConstant;
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
