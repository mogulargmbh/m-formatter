export type ErrorKind = "UNKNOWN" | "PARSER_ERROR" | "FORMATTER_ERROR" | "CSS_ERROR" | "INVALID_CONFIG" | "UNKNOWN_ENTITY";

export class FormatError extends Error
{
  constructor(message: string, public kind: ErrorKind, public innerError: Error = null, public meta: any = null)
  {
    super(message);
  }
  
  toString()
  {
    return `FormatError kind: ${this.kind}
${this.message}
stack: ${this.stack}
inner: ${this.innerError?.message}
innerStack: ${this.innerError?.stack}
meta: ${JSON.stringify(this.meta)}`;
  }
}
