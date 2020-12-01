import { Ast, TComment } from "./pq-ast";
import { BinaryOperatorExpressionExtension, BracedArrayWrapperExtension, ConstantExtension, IdentifierExpressionExtension, IdentifierExtension, LiteralExpressionExtension, PairedExpressionExtension, UnaryExpressionExtension, ArrayWrapperExtension, LetExpressionExtension, CsvExtension, BracedWrapperExtension, BaseTypeExtension, PrimitiveTypeExtension, IfExpressionExtension, FunctionExpressionExtension, PairedConstantExtension, ErrorHandlingExpressionExtension, FieldSpecificationExtension, FieldTypeSpecificationExtension, FunctionTypeExtension, NotImplementedExpressionExtension, RecordTypeExtension, RecursivePrimaryExpressionExtension, SectionExtension, SectionMemberExtension, TableTypeExtension, ParameterExtension, RangeExpressionExtension, BracedWrapperOptionalExtension, FieldProjectionExtension, FieldSpecificationListExtension } from "./node-extensions/all";
import { assertnever } from './Util';
import { ExtendedNode, IPrivateNodeExtension, INodeExtensionBase } from './base/Base';
import { IFormatterConfig } from './config/definitions';
import { extendComment } from './CommentExtension';

export function extendAll(node: Ast.INode, sourceCode: string, config: IFormatterConfig, comments: TComment[], parent: ExtendedNode = null, previous: ExtendedNode = null): ExtendedNode
{
  let res = extend(node);
  res.initialize(parent, previous, config, comments);
  let prev = res;
  for(let c of res.children)
  {
    prev = extendAll(c, sourceCode, config, comments, res, prev);
  }
  
  if(parent == null && config.includeComments == true) //root node
    res.trailingComments = comments.map(c => extendComment(c, res, "trail"));
  
  return res;
}

function isExtendedNode(node: Ast.INode): node is ExtendedNode
{
  return (node as ExtendedNode).__extendedNode == true;
}

export function extend(node: Ast.INode, parent: ExtendedNode = null): ExtendedNode
{
  let ext: any;
  if(isExtendedNode(node) == false)
  {
    ext = {
      ...getExtension(node.kind)
    };
    Object.assign(node, ext);
  }
  let res = node as ExtendedNode;
  return res;
}

export function getExtension(kind: Ast.NodeKind): IPrivateNodeExtension
{
  switch(kind)
  {
    case Ast.NodeKind.Constant:
      return ConstantExtension;
    case Ast.NodeKind.Identifier:
    case Ast.NodeKind.GeneralizedIdentifier:
      return IdentifierExtension;
    case Ast.NodeKind.EqualityExpression:
    case Ast.NodeKind.ArithmeticExpression:
    case Ast.NodeKind.AsExpression:
    case Ast.NodeKind.IsExpression:
    case Ast.NodeKind.LogicalExpression:
    case Ast.NodeKind.NullCoalescingExpression:
    case Ast.NodeKind.MetadataExpression:
    case Ast.NodeKind.RelationalExpression:
    case Ast.NodeKind.IsExpression: //TODO: review
      return BinaryOperatorExpressionExtension;
    case Ast.NodeKind.IfExpression:
      return IfExpressionExtension;
    case Ast.NodeKind.IdentifierExpression:
      return IdentifierExpressionExtension;
    case Ast.NodeKind.RangeExpression: //TODO: review
      return RangeExpressionExtension;
    case Ast.NodeKind.IdentifierPairedExpression:
    case Ast.NodeKind.GeneralizedIdentifierPairedAnyLiteral:
    case Ast.NodeKind.GeneralizedIdentifierPairedExpression:
      return PairedExpressionExtension;
    case Ast.NodeKind.LetExpression:
      return LetExpressionExtension;
    case Ast.NodeKind.Csv:
        return CsvExtension;
    case Ast.NodeKind.ArrayWrapper:
      return ArrayWrapperExtension;
    case Ast.NodeKind.LiteralExpression:
        return LiteralExpressionExtension;
    case Ast.NodeKind.UnaryExpression:
      return UnaryExpressionExtension;
    case Ast.NodeKind.FieldProjection:
      return FieldProjectionExtension;
    case Ast.NodeKind.FieldSpecificationList:
      return FieldSpecificationListExtension;
    case Ast.NodeKind.ListExpression:
    case Ast.NodeKind.ParameterList:
    case Ast.NodeKind.InvokeExpression:
    case Ast.NodeKind.ListExpression:
    case Ast.NodeKind.ListLiteral:
    case Ast.NodeKind.ListType:
    case Ast.NodeKind.RecordExpression:
    case Ast.NodeKind.RecordLiteral:
      return BracedArrayWrapperExtension;
    case Ast.NodeKind.FieldSelector:
    case Ast.NodeKind.ItemAccessExpression:
      return BracedWrapperOptionalExtension;
    case Ast.NodeKind.ParenthesizedExpression:
      return BracedWrapperExtension;
    case Ast.NodeKind.AsType:
    case Ast.NodeKind.NullablePrimitiveType:
    case Ast.NodeKind.NullableType:
    case Ast.NodeKind.AsNullablePrimitiveType:
    case Ast.NodeKind.TypePrimaryType:
      return BaseTypeExtension;
    case Ast.NodeKind.PrimitiveType:
      return PrimitiveTypeExtension;
    case Ast.NodeKind.FunctionExpression:
      return FunctionExpressionExtension;
    case Ast.NodeKind.AsNullablePrimitiveType:
    case Ast.NodeKind.AsType:
    case Ast.NodeKind.EachExpression:
    case Ast.NodeKind.ErrorRaisingExpression:
    case Ast.NodeKind.IsNullablePrimitiveType:
    case Ast.NodeKind.NullablePrimitiveType:
    case Ast.NodeKind.OtherwiseExpression:
    case Ast.NodeKind.TypePrimaryType:
      return PairedConstantExtension;
    case Ast.NodeKind.ErrorHandlingExpression:
      return ErrorHandlingExpressionExtension;
    case Ast.NodeKind.FieldSpecification:
      return FieldSpecificationExtension;
    case Ast.NodeKind.FieldTypeSpecification:
      return FieldTypeSpecificationExtension;
    case Ast.NodeKind.FunctionType:
      return FunctionTypeExtension;
    case Ast.NodeKind.NotImplementedExpression:
      return NotImplementedExpressionExtension;
    case Ast.NodeKind.Parameter:
      return ParameterExtension;
    case Ast.NodeKind.RecordType:
      return RecordTypeExtension;
    case Ast.NodeKind.RecursivePrimaryExpression:
      return RecursivePrimaryExpressionExtension;
    case Ast.NodeKind.Section:
      return SectionExtension;
    case Ast.NodeKind.SectionMember:
      return SectionMemberExtension;
    case Ast.NodeKind.TableType:
      return TableTypeExtension;
    default:
      assertnever(kind);
  }
}
