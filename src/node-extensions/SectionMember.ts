import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.SectionMember;
  
type This = ExtendedNode<NodeType>;

//This node actually breaks line but not based on state but based on the ast (only if maybeLiteralAttributes != null)

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  
  if(this.maybeLiteralAttributes)
  {
    if(this.state.stopOnLineBreak)
      return FormatResult.Break;
      
    yield this.maybeLiteralAttributes.format(s);
    s = this.subState({
      line: this.maybeLiteralAttributes.outerRange.end.line + 1,
      unit: this.currIndentUnit()
    });
  }
  
  if(this.maybeSharedConstant)
  {
    yield this.maybeSharedConstant.format(s, 0, 1);
    s = this.subState(this.maybeSharedConstant.outerRange.end);
  }
  
  yield this.namePairedExpression.format(s);
  
  s = this.subState(this.namePairedExpression.outerRange.end);
  yield this.semicolonConstant.format(s);
  
  this.setInnerRangeEnd(this.semicolonConstant);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.maybeLiteralAttributes;
  yield this.maybeSharedConstant;
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
