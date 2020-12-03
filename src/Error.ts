export type ErrorKind = "UNKNOWN" | "PARSER_ERROR" | "FORMATTER_ERROR" | "SERIALIZATION_ERROR";

export interface IGenericError
{
  message: string;
  innerError: any;
  kind: any;
  name: string;
  meta: any;
  stack: string;
}

export class GenericError<T> extends Error implements IGenericError
{
  type: string;
  stack: string;
  constructor(message: string, public kind: T, public innerError: Error = null, public meta: any = null)
  {
    super(message);
    this.name = this.constructor.name;
  }
  
  toString()
  {
    return `Error ${this.name} kind: ${this.kind}
${this.message}
stack: ${this.stack}
inner: ${this.innerError?.message}
innerStack: ${this.innerError?.stack}
meta: ${JSON.stringify(this.meta)}`;
  }
  
  toInterface(): IGenericError
  {
    return {
      message: this.message,
      kind: this.kind,
      innerError: this.innerError.toInterface(),
      meta: this.meta,
      name: this.name,
      stack: this.stack,
    }
  }
}

export class FormatError extends GenericError<ErrorKind>
{
}