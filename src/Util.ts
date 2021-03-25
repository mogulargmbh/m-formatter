import { ExtendedNode } from "./main";
import { Ast } from "./pq-ast";

export function NotSupported(...args: any[]): never
{
  throw new Error("Not supported");
}

export function getAbsoluteCodeUnit(line: number, unit: number): number
{
  return line + unit;
}

export function assertnever(_: never): never
{
  throw new Error("Should never happen");
}

const newLineRegex = /(\r\n|\n)/g;

export function spliteByLineEnd(str: string): string[]
{
  return str.split(newLineRegex).filter(e => newLineRegex.test(e) == false);
}

const brackets = "{[()]}"
export function isBracketNode(n: ExtendedNode)
{
  return brackets.indexOf((n as ExtendedNode<Ast.IConstant<any>>).constantKind) >= 0;
}


type BracketNode = Ast.ParenthesizedExpression
  | Ast.ListExpression
  | Ast.IParameterList<Ast.TParameterType> 
  | Ast.InvokeExpression
  | Ast.ListExpression
  | Ast.ListLiteral 
  | Ast.RecordExpression
  | Ast.RecordLiteral
  | Ast.FieldSpecificationList;
export function getBracketsWsInline(node: ExtendedNode<BracketNode>): {openBefore: number, openAfter: number, closeBefore: number, closeAfter: number}
{
  if(node.config.surroundBracesWithWs !== true)
  {
    return {
      openBefore: 0,
      openAfter: 0,
      closeBefore: 0,
      closeAfter: 0
    }
  }
  let hasContent = node.content != null && node.content.children.length != 0;
  let prev = node.getPreviousTextNode();
  if(prev != null && prev.innerRange.start.line != node.innerRange.start.line)
    prev = null;
  let next = node.getNextTextNode();
  let ws = node.config.surroundBracesWithWs == true && hasContent ? 1 : 0;
  
  return {
    openBefore: prev == null || isBracketNode(prev) || (prev.respectsWhitespace && prev.wsAfter) > 0 ? 0 : ws,
    openAfter: ws,
    closeBefore: ws,
    closeAfter: next == null || isBracketNode(next) ? 0 : ws
  }
}

export function getBracketWsBroken(node: ExtendedNode<BracketNode>): number
{
  if(node.config.surroundBracesWithWs !== true)
    return 0;
  
  let prev = node.getPreviousTextNode();
  if(prev != null && prev.innerRange.end.line == node.innerRange.start.line && prev.wsAfter == 0)
    return 1;
  return 0;
}