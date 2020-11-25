import { Optional } from '../interfaces';
import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatResult, genRes, IEnumerable, IPrivateNodeExtension, PrivateExtendedNode, PrivateNode } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';

export interface IArrayWrapperOpts 
{
  inlineWsBefore?: (node: ExtendedNode, index: number, length: number) => number;
  inlineWsAfter?: (node: ExtendedNode, index: number, length: number) => number;
}

type This = PrivateNode<Ast.IArrayWrapper<Ast.TCsvType>, Optional<IArrayWrapperOpts>>;

function *_formatInline(this: This): FormatGenerator
{
  let { line, unit } = this.state;
  let i = 0;
  for(let c of this.elements)
  {
    let s = this.subState({
      line,
      unit,
    })
    yield c.format(s, this.opts.inlineWsBefore(c,i,this.elements.length), this.opts.inlineWsAfter(c,i,this.elements.length));
      
    line = c.range.end.line;
    unit = c.range.end.unit;
    i++;
  }
  
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  let line: number, indent: number, unit: number;
  
  if(this.elements.length == 1)
  {
    let s = this.subState({
      forceLineBreak: true
    })
    return this.elements.first().format(s);
  }
  
  if(this.state.suppressInitialLineBreak != true)
  {
    line = this.state.line + 1;
    unit = this.nextIndentUnit();
    indent = this.state.indent + 1;
  }
  else
  {
    line = this.state.line;
    indent = this.state.indent;
    unit = this.currIndentUnit();
  }
  
  for(let c of this.elements)
  {
    let s = this.subState({
      line, 
      unit,
      indent,
      suppressInitialLineBreak: true
    });
    c.format(s);
      
    line = c.range.end.line + 1;
  }
  
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  for(let e of this.elements)
  {
    yield e;
  }
}

const defaultOpts: IArrayWrapperOpts = {
  inlineWsBefore: (n, i, l) => 0,
  inlineWsAfter: (n, i, l) => i == (l-1) ? 0 : 1
}

export const ArrayWrapperExtension: IPrivateNodeExtension<Optional<IArrayWrapperOpts>> = {
  opts: {
    ...defaultOpts
  },
  _ext: "ArrayWrapper",
  takesLeadingComments: false,
  ...BreakOnAnyChildBrokenNodeBase,
  _formatBroken,
  _formatInline,
  _children,
};
