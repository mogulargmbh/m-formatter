import { Ast } from "../pq-ast"; 
import { AlwaysInlineNodeBase } from '../base/AlwaysInline'; 
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension, PrivateNode } from '../base/Base'; 
import { NotSupported } from '../Util'; 
 
type NodeType = Ast.FieldSpecification; 
   
export type PairedExpressionOpts = { 
  alignKeys: number; 
} 
   
type This = PrivateNode<NodeType, PairedExpressionOpts>; 
 
function *_formatInline(this: This): FormatGenerator 
{ 
  let s = this.subState(); 
  let startUnit = s.unit; 
  yield this.name.format(s); 
   
  let end = this.name.outerRange.end; 
  if(this.optionalConstant) 
  { 
    s = this.subState(this.name.outerRange.end); 
    yield this.optionalConstant.format(s) 
    end = this.optionalConstant.outerRange.end; 
  } 
   
  if(this.fieldTypeSpecification) 
  { 
    let s = this.subState(end); 
    yield this.fieldTypeSpecification.format(s, null, null, {  
      alignKeys: this.opts?.alignKeys != null 
        ? (this.opts.alignKeys + startUnit) 
        : null 
    }); 
  } 
   
  this.setInnerRangeEnd(this.lastChild()) 
  return FormatResult.Ok; 
} 
 
function *_children(this: This) 
{ 
  yield this.name; 
  yield this.optionalConstant; 
  yield this.fieldTypeSpecification; 
} 
 
export const FieldSpecificationExtension: IPrivateNodeExtension = { 
  _ext: "FieldSpecification", 
  ...AlwaysInlineNodeBase, 
  _formatInline, 
  _formatBroken: NotSupported, 
  _children, 
}; 
