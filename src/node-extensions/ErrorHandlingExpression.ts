import { Ast } from "../pq-ast";
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { BreakOnAnyChildBrokenNodeBase } from '../base/BreakOnAnyChild';
import { NotSupported } from '../Util';

type NodeType = Ast.ErrorHandlingExpression;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.tryConstant.format(s, 0, 1);
  
  s = this.subState(this.tryConstant.range.end);
  yield this.protectedExpression.format(s);
    
  if(this.maybeOtherwiseExpression)
  {
    s = this.subState(this.protectedExpression.range.end);
    yield this.maybeOtherwiseExpression.format(s, 1, 0);
  }
  
  return FormatResult.Ok;
}

function _formatBroken(this: This): FormatResult
{
  let { line, unit } = this.state;
  
  if(this.state.suppressInitialLineBreak == false)
  {
    this.tryConstant.format(this.subState({
      unit: 0,
      line: line + 1,
    }));
    line += 2;
    unit = this.nextIndentUnit();
  }
  else
  {
    this.tryConstant.format(this.subState());
    line += 1;
  }
  
  this.protectedExpression.format(this.subState({
    line: line,
    unit: this.nextIndentUnit(),
    indent: this.state.indent + 1,
  }));
  
  if(this.maybeOtherwiseExpression)
  {
    let s = this.subState({
      line: this.protectedExpression.range.end.line + 1,
      indent: this.state.indent,
      unit: this.currIndentUnit(),
      forceLineBreak: true
    })
    this.maybeOtherwiseExpression.format(s);
  }
  
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.tryConstant;
  yield this.protectedExpression;
  yield this.maybeOtherwiseExpression;
}


export const ErrorHandlingExpressionExtension: IPrivateNodeExtension = {
  _ext: "ErrorHandlingExpression",
  ...BreakOnAnyChildBrokenNodeBase,
  _formatInline,
  _formatBroken,
  _children,
};
