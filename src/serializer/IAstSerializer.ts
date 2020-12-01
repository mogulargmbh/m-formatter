import { ExtendedNode } from '../base/Base';

export interface IAstSerializer<TConfig = any>
{
  config: TConfig;
  serialize(ast: ExtendedNode, config?: TConfig): string
}