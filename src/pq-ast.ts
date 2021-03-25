
export { Parser, Task, DefaultSettings, ResultKind } from '@microsoft/powerquery-parser';
export { NodeKind, TConstant } from '@microsoft/powerquery-parser/lib/powerquery-parser/language/ast/ast';
export * from "@microsoft/powerquery-parser/lib/powerquery-parser/language/ast";
export { TConstantKind, PrimitiveTypeConstantKind } from "@microsoft/powerquery-parser/lib/powerquery-parser/language/constant/constant";
export { LexerSnapshot} from "@microsoft/powerquery-parser/lib/powerquery-parser/lexer";
export { CommentKind, TComment } from '@microsoft/powerquery-parser/lib/powerquery-parser/language/comment';



// import { TComment } from '../pq-ast';

// declare module "@microsoft/powerquery-parser/lib/language/ast" {
//   interface INode
//   {
//     preNodeComments: TComment[];
//     postNodeComments: TComment[];
//   }
// }