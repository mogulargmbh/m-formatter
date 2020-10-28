import { ExtendedNode, FormatNodeKind, Range } from '../base/Base';
import { TextAstSerializer, WritableTokenPosition } from './TextAstSerializer';
import * as escapeHtml from 'escape-html';
import { NodeKind, TConstant } from '@microsoft/powerquery-parser/lib/language/ast/ast';
import { Ast } from '@microsoft/powerquery-parser/lib/language';
import { ArithmeticOperatorKind, EqualityOperatorKind, IdentifierConstantKind, KeywordConstantKind, LiteralKind, LogicalOperatorKind, MiscConstantKind, PrimitiveTypeConstantKind, RelationalOperatorKind, TConstantKind, UnaryOperatorKind, WrapperConstantKind } from '@microsoft/powerquery-parser/lib/language/constant/constant';
import { assertnever } from '../Util';
import { BaseAstSerializer } from './BaseAstSerializer';
import { IHtmlSerializerConfig } from '../config/definitions';
import { defaultHtmlSerializerConfig } from '../config/default';

export type literalClass = "string" | "list" | "boolean" | "number" | "null" | "record";
export type operatorConstantClass = "operator" | "operator-keyword" | "operator-arithmetic" | "operator-equality" | "operator-logical" | "operator-relational" | "operator-unary" | "operator-keyword";
export type typeConstantClass = "type" | "type-modifier" | "type-primitive";
export type constantClass = typeConstantClass | operatorConstantClass;
export type tokenClass = "operator-dot" |"comment" | "keyword" | "constant" | "identifier" | "operator" | "bracket" | "literal" | "unknown-node" | "method-call" | literalClass | constantClass;

export class HtmlAstSerializer extends BaseAstSerializer<{ bracket: number } & WritableTokenPosition, IHtmlSerializerConfig>
{
  constructor(
  )
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
  
  visit(n: ExtendedNode): string
  {
    let result = ""
    for(let c of n.leadingComments)
    {
      result += this.moveCursor(c.positionStart);
      result += `<span class="comment" ${this.config.debugMode == true ? ` _range="${this.printRange(c.range)}"` : ""}>`
      result += c.text + "</span>";
      this.state.lineCodeUnit += c.text.length;
      result += this.moveCursor(c.positionEnd);
    }
    
    result += this.openSpan(n);
    result += this.moveCursor(n.tokenRange.positionStart);
    
    if(n.isLeaf === true)
    {
      result += this.spanContent(n);
        
      this.state.lineNumber = n.tokenRange.positionEnd.lineNumber;
      this.state.lineCodeUnit = n.tokenRange.positionEnd.lineCodeUnit;
    }
    else
    {
      for(let c of n.children)
      {
        result += this.visit(c); 
      }
      
      result += this.moveCursor(n.tokenRange.positionEnd);
    }
    
    result += this.closeSpan(n);
    
    return result;
  }
  
  isWrapperNode(node: ExtendedNode)
  {
    return node.kind == NodeKind.Constant || node.kind == NodeKind.LiteralExpression;
  }
  
  getTokenClasses(node: ExtendedNode): tokenClass[]
  {
    switch(node.kind)
    {
      case NodeKind.Constant:
        return ["constant", ...this.getConstantTokenClass((node as ExtendedNode<Ast.TConstant>).constantKind)];
      case NodeKind.LiteralExpression:
        return ["literal", this.getLiteralTokenClass((node as ExtendedNode<Ast.LiteralExpression>).literalKind)];
      case NodeKind.Identifier:
      case NodeKind.GeneralizedIdentifier:
        return ["identifier"];
      case NodeKind.PrimitiveType:
        return ["type"];
      default:
        return null;
    }
  }
  
  openSpan(node: ExtendedNode): string
  {
    let cl = this.getTokenClasses(node);
    if(cl == null && this.config.debugMode == false)
      return "";
    
    let attributes = "";
    if(cl != null)
      attributes = `class="${cl.join(" ")}" `;
      
    if(this.config.debugMode)
    {
      attributes += `_id="${node._id}" _kind="${node.kind}" _ext="${node._ext}" _formatKind="${FormatNodeKind[node.formatKind]}" _range="${this.printRange(node.range)}" _formatCnt="${node._formatCnt}" _isBroken="${node.isBroken}" _wsBefore="${node.wsBefore}" _wsAfter="${node.wsAfter}" `;
      // attributes += `_state="${JSON.stringify(node.state).replace(/"/g, "'")}"`;
    }
      
    
    return `<span ${attributes}>`;
  }
  
  closeSpan(node)
  {
    if(this.isWrapperNode(node) == false && this.config.debugMode == false)
      return "";
      
    return `</span>`
  }
  
  spanContent(node: ExtendedNode): string
  {
    return escapeHtml(node.getContentString());
  }
  
  getConstantTokenClass(constantKind: TConstantKind): tokenClass[]
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
        let res = ["bracket", `bracket-${this.state.bracket % this.config.numBrackets}` as any]
        this.state.bracket++;
        return res;
      }
      case WrapperConstantKind.RightBrace:
      case WrapperConstantKind.RightBracket:
      case WrapperConstantKind.RightParenthesis:
      {
        this.state.bracket--;
        let res = ["bracket", `bracket-${this.state.bracket % this.config.numBrackets}` as any]
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
  
  getLiteralTokenClass(literalKind: LiteralKind): literalClass
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
}