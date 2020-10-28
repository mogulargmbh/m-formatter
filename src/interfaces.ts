import { TComment } from './pq-ast';

export interface IState
{
  numIndent: number;
  currIdx: number;
  brackets: number;
  alignPairedExpression?: number;
  deferInitialize?: boolean;
  suppressInitialLinebreaks?: boolean;
  suppressInitialWs?: boolean;
  comments: TComment[];
  forceBreak?: boolean;
}

export type Optional<T> = {
  [P in keyof T]?: T[P];
};

export type ISubState = Optional<IState>;
