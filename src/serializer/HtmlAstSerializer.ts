import { ExtendedNode, FormatNodeKind, Range } from '../base/Base';
import { TextAstSerializer, WritableTokenPosition } from './TextAstSerializer';
import * as escapeHtml from 'escape-html';
import { assertnever } from '../Util';
import { BaseAstSerializer } from './BaseAstSerializer';
import { IHtmlAstSerializerConfig } from '../config/definitions';
import { defaultHtmlSerializerConfig } from '../config/default';
import { ExtendedComment } from '../CommentExtension';
import { Ast, CommentKind, TConstant } from '../pq-ast';
import { ArithmeticOperator, EqualityOperator, KeywordConstant, LanguageConstant, LogicalOperator, MiscConstant, PrimitiveTypeConstant, RelationalOperator, UnaryOperator, WrapperConstant } from '@microsoft/powerquery-parser/lib/powerquery-parser/language/constant/constant';
import { IConstant, LiteralKind } from '@microsoft/powerquery-parser/lib/powerquery-parser/language/ast/ast';

export type literalClass = "string" | "list" | "boolean" | "number" | "null" | "record";
export type operatorConstantClass = "operator" | "operator-keyword" | "operator-arithmetic" | "operator-equality" | "operator-logical" | "operator-relational" | "operator-unary" | "operator-keyword";
export type typeConstantClass = "type" | "type-modifier" | "type-primitive";
export type constantClass = typeConstantClass | operatorConstantClass;
export type tokenClass = "operator-dot" |"comment" | "keyword" | "constant" | "identifier" | "operator" | "bracket" | "literal" | "unknown-node" | "method-call" | literalClass | constantClass;


export function getTokenClasses(node: Ast.INode, state: {bracket: number}, numBrackets: number): tokenClass[]
{
  switch(node.kind)
  {
    case Ast.NodeKind.Constant:
      return ["constant", ...getConstantTokenClass((node as ExtendedNode<Ast.TConstant>).constantKind, state, numBrackets)];
    case Ast.NodeKind.LiteralExpression:
      return ["literal", getLiteralTokenClass((node as ExtendedNode<Ast.LiteralExpression>).literalKind)];
    case Ast.NodeKind.Identifier:
    case Ast.NodeKind.GeneralizedIdentifier:
      return ["identifier"];
    case Ast.NodeKind.PrimitiveType:
      return ["type"];
    default:
      return null;
  }
}


function getConstantTokenClass(constantKind: TConstant, state: {bracket: number}, numBrackets: number): tokenClass[]
{
  switch(constantKind)
  {
    case LanguageConstant.Nullable:
    case LanguageConstant.Optional:
      return ["type", "type-modifier"];
    case ArithmeticOperator.Addition:
    case ArithmeticOperator.And:
    case ArithmeticOperator.Division:
    case ArithmeticOperator.Multiplication:
    case ArithmeticOperator.Subtraction:
      return ["operator", "operator-arithmetic"]
    case EqualityOperator.EqualTo:
    case EqualityOperator.NotEqualTo:
      return ["operator", "operator-equality"]
    case RelationalOperator.GreaterThan:
    case RelationalOperator.GreaterThanEqualTo:
    case RelationalOperator.LessThan:
    case RelationalOperator.LessThanEqualTo:
      return ["operator", "operator-relational"]
    case UnaryOperator.Negative:
    case UnaryOperator.Not:
    case UnaryOperator.Positive:
      return ["operator", "operator-unary"]
    case MiscConstant.QuestionMark:
    case MiscConstant.Equal:
    case MiscConstant.AtSign:
    case MiscConstant.NullCoalescingOperator:
    case MiscConstant.QuestionMark:
    case MiscConstant.FatArrow:
    case MiscConstant.Ellipsis:
    case MiscConstant.DotDot:
      return ["operator"]
    case KeywordConstant.As:
    case KeywordConstant.Is: 
    case LogicalOperator.And: //indistinguishable from Keyword
    case LogicalOperator.Or:  //indistinguishable from Keyword
      return ["keyword", "operator", "operator-keyword"]
    case KeywordConstant.Each:
    case KeywordConstant.Else:
    case KeywordConstant.Error:
    case KeywordConstant.False:
    case KeywordConstant.If:
    case KeywordConstant.In:
    case KeywordConstant.Let:
    case KeywordConstant.Meta:
    case KeywordConstant.Otherwise:
    case KeywordConstant.Section:
    case KeywordConstant.Shared:
    case KeywordConstant.Then:
    case KeywordConstant.True:
    case KeywordConstant.Try:
    case LanguageConstant.Catch: //TODO: makes sence?
    case KeywordConstant.Type:
      return ["keyword"]
    case PrimitiveTypeConstant.Action:
    case PrimitiveTypeConstant.Any:
    case PrimitiveTypeConstant.AnyNonNull:
    case PrimitiveTypeConstant.Binary:
    case PrimitiveTypeConstant.Date:
    case PrimitiveTypeConstant.DateTime:
    case PrimitiveTypeConstant.DateTimeZone:
    case PrimitiveTypeConstant.Duration:
    case PrimitiveTypeConstant.Function:
    case PrimitiveTypeConstant.List:
    case PrimitiveTypeConstant.Logical:
    case PrimitiveTypeConstant.None:
    case PrimitiveTypeConstant.Null:
    case PrimitiveTypeConstant.Number:
    case PrimitiveTypeConstant.Record:
    case PrimitiveTypeConstant.Table:
    case PrimitiveTypeConstant.Text:
    case PrimitiveTypeConstant.Time:
    case PrimitiveTypeConstant.Type:
      return ["type", "type-primitive"]
    case WrapperConstant.LeftBrace:
    case WrapperConstant.LeftBracket:            
    case WrapperConstant.LeftParenthesis:
    {
      let res = ["bracket", `bracket-${state.bracket % numBrackets}` as any]
      state.bracket++;
      return res;
    }
    case WrapperConstant.RightBrace:
    case WrapperConstant.RightBracket:
    case WrapperConstant.RightParenthesis:
    {
      state.bracket--;
      let res = ["bracket", `bracket-${state.bracket % numBrackets}` as any]
      return res;
    }
    case MiscConstant.Ampersand:
    case MiscConstant.Comma:
    case MiscConstant.Semicolon:
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
  
  isConstant(n: ExtendedNode): n is ExtendedNode<IConstant<TConstant>>
  {
    return n.kind == Ast.NodeKind.Constant;
  }
  
  isOpenBracket(n: ExtendedNode)
  {
    return this.isConstant(n) && (n.constantKind == WrapperConstant.LeftBrace || n.constantKind == WrapperConstant.LeftBracket || n.constantKind == WrapperConstant.LeftParenthesis)
  }
  
  isCloseBracket(n: ExtendedNode)
  {
    return this.isConstant(n) && (n.constantKind == WrapperConstant.RightBrace || n.constantKind == WrapperConstant.RightBracket || n.constantKind == WrapperConstant.RightParenthesis)
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