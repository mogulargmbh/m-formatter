import { Ast } from "../pq-ast";
import { AlwaysBreakingNodeBase } from '../base/AlwaysBreaking';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type This = ExtendedNode<Ast.LetExpression>;

function _formatBroken(this: This): FormatResult
{
  //No need for break checking as this node does always break
  let { line, indent } = this.state;
  
  if(this.state.suppressInitialLineBreak != true)
  {
    indent += 1;
    this.letConstant.format(this.subState({
      unit: this.nextIndentUnit(),
      indent: indent,
      line: line + 1,
    }));
    line += 2;
  }
  else
  {
    this.letConstant.format(this.subState());
    line += 1;
  }
  
  this.variableList.format(this.subState({
    line: line,
    unit: this.indentUnit(indent + 1),
    indent: indent + 1,
    forceLineBreak: true,
    suppressInitialLineBreak: true
  }));
  
  line = this.variableList.range.end.line + 1;
  
  this.inConstant.format(this.subState({
    line: line,
    unit: this.indentUnit(indent)
  }));
  
  line += 1;
  
  this.expression.format(this.subState({
    line,
    indent: indent + 1,
    unit: this.indentUnit(indent + 1)
  }));
  
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.letConstant;
  yield this.variableList;
  yield this.inConstant;
  yield this.expression;
}

export const LetExpressionExtension: IPrivateNodeExtension = {
  _ext: "LetExpression",
  ...AlwaysBreakingNodeBase,
  _formatBroken,
  _formatInline: NotSupported,
  _children,
};
