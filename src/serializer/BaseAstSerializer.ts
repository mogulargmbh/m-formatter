import { Cursor, ExtendedNode, traverse } from '../base/Base';
import { TokenPosition } from '@microsoft/powerquery-parser/lib/language/token';
import { IAstSerializer } from './IAstSerializer';
import { Optional } from '../interfaces';

export type WritableTokenPosition = {
  lineNumber: number,
  lineCodeUnit: number;
}

type BaseAstSerializerConfig = {
  lineEnd: string;
  ws: string;
}

export abstract class BaseAstSerializer<T extends WritableTokenPosition, TConfig extends BaseAstSerializerConfig> implements IAstSerializer<TConfig>
{
  config: TConfig;
  state: T;
  
  constructor(
    private defaultConfig: TConfig
  )
  {
    
  }
  
  abstract _serialize(n: ExtendedNode): string;
  
  getInitialState(): T
  {
    return {
      lineNumber: 0,
      lineCodeUnit: 0
    } as T;
  }
  
  serialize(ast: ExtendedNode, config: Optional<TConfig> = null): string
  {
    this.state = this.getInitialState()
    this.config = {
      ...this.defaultConfig,
      ...(config ?? {})
    }
    return this._serialize(ast);
  }
  
  assertPosition(pos: WritableTokenPosition)
  {
    if(pos.lineNumber < this.state.lineNumber || pos.lineCodeUnit < this.state.lineCodeUnit)
      throw new Error("Error during serialization: Cursor may never be moved backwards!");
  }
  
  moveCursor(pos: TokenPosition): string
  {
    let result = "";
    for(let i = 0; i < pos.lineNumber - this.state.lineNumber; i++)
    {
      result += this.config.lineEnd;
      this.state.lineCodeUnit = 0;
    }
    
    for(let i = 0; i < pos.lineCodeUnit - this.state.lineCodeUnit; i++)
    {
      result += this.config.ws;
    }
    this.state.lineNumber = pos.lineNumber;
    this.state.lineCodeUnit = pos.lineCodeUnit;
    
    return result;
  }
  
}
