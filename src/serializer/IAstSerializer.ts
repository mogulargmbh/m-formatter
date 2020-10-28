import { ExtendedNode } from '../base/Base';

export interface IAstSerializer<TConfig>
{
  config: TConfig;
  serialize(ast: ExtendedNode, config?: TConfig): string
}