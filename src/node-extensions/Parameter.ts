import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.TParameter;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  if(this.maybeOptionalConstant)
  {
    yield this.maybeOptionalConstant.format(s, 0, 1);
    s = this.subState(this.maybeOptionalConstant.range.end);
  }
  
  yield this.name.format(s);
  
  if(this.maybeParameterType)
  {
    s = this.subState(this.name.range.end);
    yield this.maybeParameterType.format(s)
  }
    
  this.setRangeEnd(this.lastChild());
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.maybeOptionalConstant;
  yield this.name;
  yield this.maybeParameterType;
}

export const ParameterExtension: IPrivateNodeExtension = {
  _ext: "Parameter",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
