import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatResult, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.SectionMember;
  
type This = ExtendedNode<NodeType>;

//This node actually breaks line but not based on state but based on the ast (only if literalAttributes != null)

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  
  if(this.literalAttributes)
  {
    if(this.state.stopOnLineBreak)
      return FormatResult.Break;
      
    yield this.literalAttributes.format(s);
    s = this.subState({
      line: this.literalAttributes.outerRange.end.line + 1,
      unit: this.currIndentUnit()
    });
  }
  
  if(this.sharedConstant)
  {
    yield this.sharedConstant.format(s, 0, 1);
    s = this.subState(this.sharedConstant.outerRange.end);
  }
  
  yield this.namePairedExpression.format(s);
  
  s = this.subState(this.namePairedExpression.outerRange.end);
  yield this.semicolonConstant.format(s);
  
  this.setInnerRangeEnd(this.semicolonConstant);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.literalAttributes;
  yield this.sharedConstant;
  yield this.namePairedExpression;
  yield this.semicolonConstant;
}


export const SectionMemberExtension: IPrivateNodeExtension = {
  _ext: "SectionMember",
  ...AlwaysInlineNodeBase,
  takesLeadingComments: false,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
