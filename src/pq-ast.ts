export { Parser, Task, DefaultSettings, ResultKind } from '@microsoft/powerquery-parser';
export * from "@microsoft/powerquery-parser/lib/language/ast";
export { LiteralKind, TConstantKind, PrimitiveTypeConstantKind } from "@microsoft/powerquery-parser/lib/language/constant/constant";
export { LexerSnapshot} from "@microsoft/powerquery-parser/lib/lexer";
export { CommentKind, TComment } from '@microsoft/powerquery-parser/lib/language/comment';

// import { TComment } from '../pq-ast';

// declare module "@microsoft/powerquery-parser/lib/language/ast" {
//   interface INode
//   {
//     preNodeComments: TComment[];
//     postNodeComments: TComment[];
//   }
// }