import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.TParameter;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  if(this.optionalConstant)
  {
    yield this.optionalConstant.format(s, 0, 1);
    s = this.subState(this.optionalConstant.outerRange.end);
  }
  
  yield this.name.format(s);
  
  if(this.parameterType)
  {
    s = this.subState(this.name.outerRange.end);
    yield this.parameterType.format(s)
  }
    
  this.setInnerRangeEnd(this.lastChild());
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.optionalConstant;
  yield this.name;
  yield this.parameterType;
}

export const ParameterExtension: IPrivateNodeExtension = {
  _ext: "Parameter",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
