import { Optional } from '../interfaces';
import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { PairedExpressionOpts } from './PairedExpression';
import { AlignmentStrategy } from '../config/definitions';

export interface IArrayWrapperOpts 
{
  inlineWsBefore?: (node: ExtendedNode, index: number, length: number) => number; //only inline
  inlineWsAfter?: (node: ExtendedNode, index: number, length: number) => number;  //only inline
}

type This = PrivateNode<Ast.TArrayWrapper, Optional<IArrayWrapperOpts>>;

function isCsv(node: Ast.INode): node is Ast.ICsv<any>
{
  return node.kind == Ast.NodeKind.Csv;
}

type PairedExpr = Ast.IdentifierPairedExpression | Ast.GeneralizedIdentifierPairedExpression | Ast.GeneralizedIdentifierPairedAnyLiteral;
function isPairedExpression(node: Ast.INode): node is PairedExpr
{
  return node.kind == Ast.NodeKind.IdentifierPairedExpression 
    || node.kind == Ast.NodeKind.GeneralizedIdentifierPairedExpression 
    || node.kind == Ast.NodeKind.GeneralizedIdentifierPairedAnyLiteral;
}

function isPairedExpressionArray(node: This): node is PrivateNode<Ast.IArrayWrapper<Ast.ICsv<PairedExpr>>>
{
  return node.elements.all(e => isCsv(e) && isPairedExpression(e.node));
}

function getAlignmentStrategy(node: This): AlignmentStrategy
{
  let parent = node.parent;
  let s = AlignmentStrategy.never;
  
  if(parent.kind == Ast.NodeKind.LetExpression)
    s = node.config.alignPairedLetExpressionsByEqual;
  else if(parent.kind == Ast.NodeKind.RecordExpression || parent.kind == Ast.NodeKind.RecordLiteral || parent.kind == Ast.NodeKind.RecordType)
    s = node.config.alignPairedRecordExpressionsByEqual;
  else
    return AlignmentStrategy.never;
  
  if(isPairedExpressionArray(node) == false)
    s = AlignmentStrategy.never;
    
  return s;
}


function *_formatInline(this: This): FormatGenerator
{
  let { line, unit } = this.state;
  let i = 0;
  
  if(this.elements.any(c => (c.trailingComments && c.trailingComments.length != 0)))
    return FormatResult.Break;
  
  for(let c of this.elements)
  {
    let s = this.subState({
      line,
      unit,
    });
    yield c.format(s, this.opts.inlineWsBefore(c, i, this.elements.length), this.opts.inlineWsAfter(c, i, this.elements.length));
      
    line = c.outerRange.end.line;
    unit = c.outerRange.end.unit;
    i++;
  }
  
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  let line: number, indent: number, unit: number;
  
  if(this.elements.first().kind == "InvokeExpression") //This is a special case I observed when a InvokeExpression and ItemAccessExpression or other expressions are used consecutively (case 35)
    return formatInvokeExpressionBroken.bind(this)();
  
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
  
  let strategy = getAlignmentStrategy(this);
  if(strategy == AlignmentStrategy.never)
  {
    formatElements(this, null, line, indent, unit, false);
  }
  else
  {
    
    let keyLength = (this as Ast.IArrayWrapper<Ast.ICsv<PairedExpr>>).elements.reduce((c,v) => c < v.node.key.literal.length ? v.node.key.literal.length : c, 0);
    let opts: PairedExpressionOpts = {
      alignKeys: keyLength
    };
    if(strategy == AlignmentStrategy.always)
    {
      formatElements(this, opts, line, indent, unit, false);
    }
    else //singleline
    {
      if(formatElements(this, opts, line, indent, unit, true) == false)
      {
        opts.alignKeys = null;
        formatElements(this, opts, line, indent, unit, false);
      }
    }
  }
  
  return FormatResult.Ok;
}

function formatElements(node: This, opts: any, line: number, indent: number, unit: number, breakOnNewline: boolean) 
{
  for(let c of node.elements)
  {
    let s = node.subState({
      line, 
      unit,
      indent,
      suppressInitialLineBreak: true
    });
    let res = c.format(s, null, null, opts);
    if(c.outerRange.end.line != line && breakOnNewline == true)
      return false;
      
    line = c.outerRange.end.line + 1;
  }
  return true;
}

function formatInvokeExpressionBroken(this: This)
{
  let invoke = this.elements.first();
  let s = this.subState();
  
  invoke.format(s);
  s = this.subState(invoke.outerRange.end);
  let res: FormatResult;
  for(let e of this.elements.slice(1))
  {
    res = e.format(s);
    s = this.subState(e.outerRange.end);
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
  inlineWsAfter: (n, i, l) => i == (l-1) ? 0 : 0
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
