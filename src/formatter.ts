import { FormatError } from './Error';
import { extendAll, assignComments } from './Factory';
import { Optional } from './interfaces';
import { IFormatterConfig } from './config/definitions';
import { defaultFormatterConfig } from './config/default';
import { ExtendedNode, IFormatState } from './base/Base';
import { TComment, TaskUtils, DefaultSettings, ResultKind, Ast } from './pq-ast';

export function parse(code: string): [Ast.INode, TComment[]]
{
  let parsed = TaskUtils.tryLexParse(
    DefaultSettings, 
    code
  );
  
  if(parsed.resultKind == ResultKind.Ok)
    return [parsed.ast, parsed.lexerSnapshot.comments.slice()];
  else
    throw new FormatError("Could not parse code", "PARSER_ERROR", parsed.error);
}

export function format(ast: ExtendedNode, formatterConfig: Optional<IFormatterConfig> = null): ExtendedNode
{
  let cfg: IFormatterConfig = {
    ...defaultFormatterConfig,
    ...(formatterConfig ?? {})
  }
  
  try
  {
    let state: IFormatState = {
      unit: 0,
      line: 0,
      indent: 0,
      suppressInitialLineBreak: true,
      config: cfg,
    }
    let r = ast.format(state); //TODO: result relevant?
    ast.updateTokenRange();
    return ast;
  }
  catch(error)
  {
    throw formatExceptionHandler(error);
  }
}

export function extendAndFormat(ast: Ast.INode, comments: TComment[], formatterConfig: Optional<IFormatterConfig> = null)
{
  try 
  {
    let extended = extendAll(ast);
    assignComments(extended, comments);
    return format(extended, formatterConfig);
  } 
  catch (error) 
  {
    throw formatExceptionHandler(error); 
  }
  
}

export function formatCode(code: string, config: Optional<IFormatterConfig> = null): ExtendedNode
{
  try
  {
    let [ast, comments] = parse(code);
    return extendAndFormat(ast, comments, config);
  }
  catch(err)
  {
    throw formatExceptionHandler(err); 
  }
}

function formatExceptionHandler(error)
{
  if(error instanceof FormatError)
    return error;
  else 
    return new FormatError("Could not format code", "FORMATTER_ERROR", error);
}