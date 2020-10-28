export * from "@microsoft/powerquery-parser/lib/language/ast";
export { TComment, CommentKind } from '@microsoft/powerquery-parser/lib/language/comment';
export { LiteralKind, TConstantKind, PrimitiveTypeConstantKind } from "@microsoft/powerquery-parser/lib/language/constant/constant";
export { LexerSnapshot} from "@microsoft/powerquery-parser/lib/lexer";

// import { TComment } from '@microsoft/powerquery-parser/lib/language/comment';

// declare module "@microsoft/powerquery-parser/lib/language/ast" {
//   interface INode
//   {
//     preNodeComments: TComment[];
//     postNodeComments: TComment[];
//   }
// }