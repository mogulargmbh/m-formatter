import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base';
import { BreakOnLineEndNodeBase } from '../base/BreakOnLineEnd';
import { NotSupported } from '../Util';

type PairedExpression = Ast.IdentifierPairedExpression 
  | Ast.GeneralizedIdentifierPairedExpression
  | Ast.GeneralizedIdentifierPairedAnyLiteral;
  
export type PairedExpressionOpts = {
  alignKeys: number;
}
  
type This = PrivateNode<PairedExpression, PairedExpressionOpts>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.key.format(s);
  
  s = this.subState(this.key.outerRange.end);
  if(this.opts.alignKeys != null)
  {
    yield this.equalConstant.format(s, this.opts.alignKeys - this.key.literal.length + 1, 1); 
  }
  else
  {
    yield this.equalConstant.format(s, 1, 1);
  }
  
  s = this.subState(this.equalConstant.outerRange.end);
  yield this.value.format(this.subState(s));
    
  return FormatResult.Ok;
}

function _formatBroken(this: This)
{
  this.key.format(this.subState());
  
  this.equalConstant.format(this.subState({
    unit: this.nextIndentUnit(),
    line: this.state.line + 1
  }), 0, 1);
  
  this.value.format(this.subState(this.equalConstant.outerRange.end)); //No need for notify break as this node is breaking hence when state.notifyBreak is true this._formatBroken would nevre be called!
  
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.key;
  yield this.equalConstant;
  yield this.value;
}

const defaultOpts: PairedExpressionOpts = {
  alignKeys: null
}

export const PairedExpressionExtension: IPrivateNodeExtension = {
  _ext: "PairedExpression",
  opts: {
    ...defaultOpts
  },
  ...BreakOnLineEndNodeBase,
  takesLeadingComments: false,
  _formatInline,
  _formatBroken,
  _children,
};
