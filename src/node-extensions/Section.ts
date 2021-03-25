import { Ast } from "../pq-ast";
import { ExtendedNode, FormatResult, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';
import { AlwaysBreakingNodeBase } from '../base/AlwaysBreaking';

type PairedExpression = Ast.Section;
  
type This = ExtendedNode<PairedExpression>;

function _formatBroken(this: This): FormatResult
{
  let s = this.subState();
  if(this.maybeLiteralAttributes)
  {
    this.maybeLiteralAttributes.format(s);
      
    s = this.subState({
      line: this.maybeLiteralAttributes.outerRange.end.line + 1,
      unit: this.currIndentUnit(),
    });
  }
  
  this.sectionConstant.format(s, 0, 1);
  
  s = this.subState(this.sectionConstant.outerRange.end);
  if(this.maybeName)
  {
    this.maybeName.format(s);
    s = this.subState(this.maybeName.outerRange.end);
  }
  
  this.semicolonConstant.format(s);
  
  s = this.subState({
    line: this.semicolonConstant.outerRange.end.line + 1,
    unit: this.config.indentSectionMembers == true ? this.nextIndentUnit() : this.currIndentUnit(),
    indent: this.state.indent + (this.config.indentSectionMembers == true ? 1 : 0),
    forceLineBreak: true,
    suppressInitialLineBreak: true
  })
  this.sectionMembers.format(s);
    
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.maybeLiteralAttributes;
  yield this.sectionConstant;
  yield this.maybeName;
  yield this.semicolonConstant;
  yield this.sectionMembers;
}

export const SectionExtension: IPrivateNodeExtension = {
  _ext: "Section",
  ...AlwaysBreakingNodeBase,
  _formatInline: NotSupported,
  _formatBroken,
  _children,
};
