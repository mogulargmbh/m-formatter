import { Ast } from "../pq-ast"; 
import { ExtendedNode, FormatGenerator, FormatResult, IPrivateNodeExtension, PrivateNode } from '../base/Base'; 
import { NotSupported } from '../Util'; 
import { AlwaysInlineNodeBase } from '../base/AlwaysInline'; 
 
type NodeType = Ast.FieldTypeSpecification; 
   
export type PairedExpressionOpts = { 
  alignKeys: number; 
} 
   
type This = PrivateNode<NodeType, PairedExpressionOpts>; 
 
function *_formatInline(this: This): FormatGenerator 
{ 
  let s = this.subState(); 
   
  if(this.opts.alignKeys != null) 
  { 
    yield this.equalConstant.format(s, this.opts.alignKeys - s.unit + 1, 1);  
  } 
  else 
  { 
    yield this.equalConstant.format(s, 1, 1); 
  } 
   
  s = this.subState(this.equalConstant.outerRange.end); 
  yield this.fieldType.format(s); 
     
  this.setInnerRangeEnd(this.fieldType); 
  return FormatResult.Ok; 
} 
 
function *_children(this: This) 
{ 
  yield this.equalConstant; 
  yield this.fieldType; 
} 
 
export const FieldTypeSpecificationExtension: IPrivateNodeExtension = { 
  _ext: "FieldTypeSpecification", 
  ...AlwaysInlineNodeBase, 
  _formatInline, 
  _formatBroken: NotSupported, 
  _children, 
}; 
