import { Player } from './player.model';
import { Card } from './card.model';

export interface PlayedCard {
  playerId: number;
  card: Card;
}

export type { Player };

export interface GameState {
  round: number;
  players: Player[];
  playedCards: PlayedCard[];
  currentPlayerId: number;
  cardsThisRound: number;
  phase: 'bidding' | 'playing' | 'end-round';
  lastTrickWinnerId: number | null;
  lastTrickWinningCardId: number | null;
  biddingConfirmed: boolean;
}
