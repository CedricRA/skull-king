import { Card } from './card.model';

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  score: number;
  bid: number;
  tricks: number;
  isCurrent?: boolean;
}
