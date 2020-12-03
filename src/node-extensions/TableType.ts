import { TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from "../pq-ast";
import { AlwaysInlineNodeBase } from '../base/AlwaysInline';
import { ExtendedNode, FormatGenerator, FormatNodeKind, FormatResult, IEnumerable, IPrivateNodeExtension } from '../base/Base';
import { NotSupported } from '../Util';

type NodeType = Ast.TableType;
  
type This = ExtendedNode<NodeType>;

function *_formatInline(this: This): FormatGenerator
{
  let s = this.subState();
  yield this.tableConstant.format(s, 0, 1);
  
  s = this.subState(this.tableConstant.outerRange.end);
  yield this.rowType.format(s);
    
  this.setInnerRangeEnd(this.rowType);
  return FormatResult.Ok;
}

function *_children(this: This)
{
  yield this.tableConstant;
  yield this.rowType;
}


export const TableTypeExtension: IPrivateNodeExtension = {
  _ext: "TableType",
  ...AlwaysInlineNodeBase,
  _formatInline,
  _formatBroken: NotSupported,
  _children,
};
