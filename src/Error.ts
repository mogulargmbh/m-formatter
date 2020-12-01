export type ErrorKind = "UNKNOWN" | "PARSER_ERROR" | "FORMATTER_ERROR" | "SERIALIZATION_ERROR";

export class GenericError<T> extends Error
{
  constructor(message: string, public kind: T, public innerError: Error = null, public meta: any = null)
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

export class FormatError extends GenericError<ErrorKind>
{
  
}