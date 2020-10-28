import { Task, DefaultSettings, ResultKind, Parser } from '@microsoft/powerquery-parser';
import { FormatError } from './Error';
import { extendAll } from './Factory';
import { Ast } from '@microsoft/powerquery-parser/lib/language';
import { Optional } from './interfaces';
import { IFormatterConfig } from './config/definitions';
import { defaultFormatterConfig } from './config/default';
import { ExtendedNode, IFormatState } from './base/Base';
import { TComment } from './pq-ast';


export function parse(code: string): [Ast.INode, TComment[]]
{
  let parsed = Task.tryLexParse(
    DefaultSettings, 
    code,
    Parser.IParserStateUtils.stateFactory
  );
  if(parsed.kind == ResultKind.Ok)
  {
    return [parsed.value.root, parsed.value.lexerSnapshot.comments.slice()];
  }
  else
  {
    throw new FormatError("Could not parse code", "PARSER_ERROR", parsed.error);
  }
}

export function format(code: string, formatterConfig: Optional<IFormatterConfig> = null): ExtendedNode
{
  let [ast, comments] = parse(code);
  let cfg: IFormatterConfig = {
    ...defaultFormatterConfig,
    ...(formatterConfig ?? {})
  }
  
  let result = null;
  let errors: FormatError[];
  try
  {
    //TODO: config
    let extended = extendAll(ast, code, cfg, comments);
    let state: IFormatState = {
      unit: 0,
      line: 0,
      indent: 0,
      suppressInitialLineBreak: true,
    }
    let r = extended.format(state);
    extended.updateTokenRange();
    return extended;
  }
  catch(error)
  {
    if(error instanceof FormatError)
      throw error;
    else 
      throw new FormatError("Could not format code", "FORMATTER_ERROR", error);
  }
}
