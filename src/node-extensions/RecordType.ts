import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.RecordType;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.fields.format(s);
    
  this.setInnerRangeEnd(this.fields);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.fields;
}


export const RecordTypeExtension: IPrivateNodeExtension = {
  _ext: "RecordType",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
