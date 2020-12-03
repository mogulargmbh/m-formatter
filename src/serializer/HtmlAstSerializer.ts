import { ExtendedNode, FormatNodeKind, Range } from '../base/Base';
import { TextAstSerializer, WritableTokenPosition } from './TextAstSerializer';
import * as escapeHtml from 'escape-html';
import { NodeKind, TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from '@microsoft/powerquery-parser/lib/language';
import { ArithmeticOperatorKind, EqualityOperatorKind, IdentifierConstantKind, KeywordConstantKind, LiteralKind, LogicalOperatorKind, MiscConstantKind, PrimitiveTypeConstantKind, RelationalOperatorKind, TConstantKind, UnaryOperatorKind, WrapperConstantKind } from '@microsoft/powerquery-parser/lib/language/constant/constant';
import { assertnever } from '../Util';
import { BaseAstSerializer } from './BaseAstSerializer';
import { IHtmlAstSerializerConfig } from '../config/definitions';
import { defaultHtmlSerializerConfig } from '../config/default';
import { ExtendedComment } from '../CommentExtension';
import { CommentKind } from '../pq-ast';

export type literalClass = "string" | "list" | "boolean" | "number" | "null" | "record";
export type operatorConstantClass = "operator" | "operator-keyword" | "operator-arithmetic" | "operator-equality" | "operator-logical" | "operator-relational" | "operator-unary" | "operator-keyword";
export type typeConstantClass = "type" | "type-modifier" | "type-primitive";
export type constantClass = typeConstantClass | operatorConstantClass;
export type tokenClass = "operator-dot" |"comment" | "keyword" | "constant" | "identifier" | "operator" | "bracket" | "literal" | "unknown-node" | "method-call" | literalClass | constantClass;


export function getTokenClasses(node: Ast.INode, state: {bracket: number}, numBrackets: number): tokenClass[]
{
  switch(node.kind)
  {
    case NodeKind.Constant:
      return ["constant", ...getConstantTokenClass((node as ExtendedNode<Ast.TConstant>).constantKind, state, numBrackets)];
    case NodeKind.LiteralExpression:
      return ["literal", getLiteralTokenClass((node as ExtendedNode<Ast.LiteralExpression>).literalKind)];
    case NodeKind.Identifier:
    case NodeKind.GeneralizedIdentifier:
      return ["identifier"];
    case NodeKind.PrimitiveType:
      return ["type"];
    default:
      return null;
  }
}

function getConstantTokenClass(constantKind: TConstantKind, state: {bracket: number}, numBrackets: number): tokenClass[]
{
  switch(constantKind)
  {
    case IdentifierConstantKind.Nullable:
    case IdentifierConstantKind.Optional:
      return ["type", "type-modifier"];
    case ArithmeticOperatorKind.Addition:
    case ArithmeticOperatorKind.And:
    case ArithmeticOperatorKind.Division:
    case ArithmeticOperatorKind.Multiplication:
    case ArithmeticOperatorKind.Subtraction:
      return ["operator", "operator-arithmetic"]
    case EqualityOperatorKind.EqualTo:
    case EqualityOperatorKind.NotEqualTo:
      return ["operator", "operator-equality"]
    case RelationalOperatorKind.GreaterThan:
    case RelationalOperatorKind.GreaterThanEqualTo:
    case RelationalOperatorKind.LessThan:
    case RelationalOperatorKind.LessThanEqualTo:
      return ["operator", "operator-relational"]
    case UnaryOperatorKind.Negative:
    case UnaryOperatorKind.Not:
    case UnaryOperatorKind.Positive:
      return ["operator", "operator-unary"]
    case MiscConstantKind.QuestionMark:
    case MiscConstantKind.Equal:
    case MiscConstantKind.AtSign:
    case MiscConstantKind.NullCoalescingOperator:
    case MiscConstantKind.QuestionMark:
    case MiscConstantKind.FatArrow:
    case MiscConstantKind.Ellipsis:
    case MiscConstantKind.DotDot:
      return ["operator"]
    case KeywordConstantKind.And:
    case KeywordConstantKind.Or:
    case KeywordConstantKind.As:
    case KeywordConstantKind.Is: 
    case LogicalOperatorKind.And: //indistinguishable from Keyword
    case LogicalOperatorKind.Or:  //indistinguishable from Keyword
      return ["keyword", "operator", "operator-keyword"]
    case KeywordConstantKind.Each:
    case KeywordConstantKind.Else:
    case KeywordConstantKind.Error:
    case KeywordConstantKind.False:
    case KeywordConstantKind.If:
    case KeywordConstantKind.In:
    case KeywordConstantKind.Let:
    case KeywordConstantKind.Meta:
    case KeywordConstantKind.Otherwise:
    case KeywordConstantKind.Section:
    case KeywordConstantKind.Shared:
    case KeywordConstantKind.Then:
    case KeywordConstantKind.True:
    case KeywordConstantKind.Try:
    case KeywordConstantKind.Type:
      return ["keyword"]
    case PrimitiveTypeConstantKind.Action:
    case PrimitiveTypeConstantKind.Any:
    case PrimitiveTypeConstantKind.AnyNonNull:
    case PrimitiveTypeConstantKind.Binary:
    case PrimitiveTypeConstantKind.Date:
    case PrimitiveTypeConstantKind.DateTime:
    case PrimitiveTypeConstantKind.DateTimeZone:
    case PrimitiveTypeConstantKind.Duration:
    case PrimitiveTypeConstantKind.Function:
    case PrimitiveTypeConstantKind.List:
    case PrimitiveTypeConstantKind.Logical:
    case PrimitiveTypeConstantKind.None:
    case PrimitiveTypeConstantKind.Null:
    case PrimitiveTypeConstantKind.Number:
    case PrimitiveTypeConstantKind.Record:
    case PrimitiveTypeConstantKind.Table:
    case PrimitiveTypeConstantKind.Text:
    case PrimitiveTypeConstantKind.Time:
    case PrimitiveTypeConstantKind.Type:
      return ["type", "type-primitive"]
    case WrapperConstantKind.LeftBrace:
    case WrapperConstantKind.LeftBracket:            
    case WrapperConstantKind.LeftParenthesis:
    {
      let res = ["bracket", `bracket-${state.bracket % numBrackets}` as any]
      state.bracket++;
      return res;
    }
    case WrapperConstantKind.RightBrace:
    case WrapperConstantKind.RightBracket:
    case WrapperConstantKind.RightParenthesis:
    {
      state.bracket--;
      let res = ["bracket", `bracket-${state.bracket % numBrackets}` as any]
      return res;
    }
    case MiscConstantKind.Ampersand:
    case MiscConstantKind.Comma:
    case MiscConstantKind.Semicolon:
      return [];
    default: 
      assertnever(constantKind)
    //TODO: MiscConstantsKind??
  }
}

function getLiteralTokenClass(literalKind: LiteralKind): literalClass
{
  switch(literalKind)
  {
    case LiteralKind.List:
      return "list"; 
    case LiteralKind.Logical:
      return "boolean"; 
    case LiteralKind.Null:
      return "null"; 
    case LiteralKind.Numeric:
      return "number"; 
    case LiteralKind.Record:
      return "record"; 
    case LiteralKind.Text:
      return "string"; 
    default:
      assertnever(literalKind);
  } 
}


export class HtmlAstSerializer extends BaseAstSerializer<{ bracket: number } & WritableTokenPosition, IHtmlAstSerializerConfig>
{
  constructor()
  {
    super(defaultHtmlSerializerConfig);
  }
  
  getInitialState()
  {
    return {
      lineNumber: 0,
      lineCodeUnit: 0,
      bracket: 0
    };
  }
  
  isConstant(n: ExtendedNode): n is ExtendedNode<TConstant>
  {
    return n.kind == Ast.NodeKind.Constant;
  }
  
  isOpenBracket(n: ExtendedNode)
  {
    return this.isConstant(n) && (n.constantKind == WrapperConstantKind.LeftBrace || n.constantKind == WrapperConstantKind.LeftBracket || n.constantKind == WrapperConstantKind.LeftParenthesis)
  }
  
  isCloseBracket(n: ExtendedNode)
  {
    return this.isConstant(n) && (n.constantKind == WrapperConstantKind.RightBrace || n.constantKind == WrapperConstantKind.RightBracket || n.constantKind == WrapperConstantKind.RightParenthesis)
  }
  
  printRange(range: Range)
  {
    return `${range.start.line}:${range.start.unit}-${range.end.line}:${range.end.unit}`
  }
  
  visitComment(c: ExtendedComment): string
  {
    let result = "";
    result += this.moveCursor(c.positionStart);
    if(c.kind == CommentKind.Multiline && c.lines.length > 1)
    {
      c.lines.forEach((l,i,a) => {
        result += `<span class="comment" ${this.config.debugMode == true ? ` _range="${this.printRange(c.range)}" _commentKind="${c.commentKind}" _node_id="${c.node._id}"` : ""}>`
        result += escapeHtml(l);
        result += "</span>";
        if(i < a.length - 1)
        {
          result += this.config.lineEnd;
          this.state.lineNumber += 1;
        }
      });
      this.state.lineCodeUnit = c.lines.last().length;
    }
    else
    {
      
      let content = c.data.trim();
      result += `<span class="comment" ${this.config.debugMode == true ? ` _range="${this.printRange(c.range)}" _commentKind="${c.commentKind}" _node_id="${c.node._id}"` : ""}>`
      result += escapeHtml(content)
      result += "</span>";
      this.state.lineCodeUnit += content.length;
    }
    result += this.moveCursor(c.positionEnd);
    return result;
  }
  
  visit(n: ExtendedNode): string
  {
    let result = "";
    if(n.config.includeComments == true)
    {
      for(let c of n.leadingComments)
      {
        result += this.visitComment(c);
      }
    }
    
    result += this.openSpan(n);
    result += this.moveCursor(n.tokenRange.positionStart);

    if(n.isLeaf === true)
    {
      let content = n.getContentString();
      result += this.spanContent(content);
      this.state.lineCodeUnit += content.length;
    }
    else
    {
      for(let c of n.children)
      {
        result += this._serialize(c); 
      }
    }
    
    result += this.moveCursor(n.tokenRange.positionEnd);
    result += this.closeSpan(n);
    
    if(n.config.includeComments == true)
    {
      for(let c of n.trailingComments)
      {
        result += this.visitComment(c);
      }
    }
    
    return result;
  }
  
  protected _serialize(node: ExtendedNode): string
  {
    let serialized = this.visit(node);
    return serialized;
  }
  
  noSpanRequired(node: ExtendedNode)
  {
    return node.hasContentString() == false 
      && (node.trailingComments == null || node.trailingComments.length == 0)
      && (node.leadingComments == null || node.leadingComments.length == 0)
      && this.config.debugMode == false;
  }
  
  openSpan(node: ExtendedNode): string
  {
    if(this.noSpanRequired(node))
      return "";
      
    let cl = getTokenClasses(node, this.state, this.config.numBrackets);
    
    let attributes = "";
    if(cl != null)
      attributes = `class="${cl.join(" ")}" `;
      
    if(this.config.debugMode)
    {
      attributes += `_id="${node._id}" _kind="${node.kind}" _ext="${node._ext}" _formatKind="${FormatNodeKind[node.formatKind]}" _innerRange="${this.printRange(node.innerRange)}" _outerRange="${this.printRange(node.outerRange)}" _formatCnt="${node._formatCnt}" _isBroken="${node.isBroken}" _wsBefore="${node.wsBefore}" _wsAfter="${node.wsAfter}" `;
      // attributes += `_state="${JSON.stringify(node.state).replace(/"/g, "'")}"`;
    }
    return `<span ${attributes}>`;
  }
  
  closeSpan(node)
  {
    if(this.noSpanRequired(node))
      return "";
    return `</span>`
  }
  
  spanContent(content: string): string
  {
    return escapeHtml(content);
  }
}