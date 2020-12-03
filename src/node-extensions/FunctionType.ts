import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.FunctionType
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  this.setOuterRangeStart();
  
  let s = this.subState();
  yield this.functionConstant.format(s, 0, 1);
  
  let end = this.functionConstant.outerRange.end;
  if(this.parameters)
  {
    yield this.parameters.format(this.subState(end));
    end = this.parameters.outerRange.end;
  }
  
  yield this.functionReturnType.format(this.subState(end));
    
  this.setInnerRangeEnd(this.functionReturnType);
  return FormatResult.Ok;
}

function *_children(this: This): IEnumerable<ExtendedNode>
{
  yield this.functionConstant;
  yield this.parameters;
  yield this.functionReturnType;
}

export const FunctionTypeExtension: IPrivateNodeExtension = {
  _ext: "FunctionType",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
