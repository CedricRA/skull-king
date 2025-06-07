export type CardColor =
  | 'spades'
  | 'hearts'
  | 'diamonds'
  | 'clubs'
  | 'pirate'
  | 'escape'
  | 'skullking'
  | 'mermaid'
  | 'scarymary';

export interface Card {
  id: number;
  color: CardColor;
  value?: number; // 1 à 14 pour les couleurs, undefined pour les spéciales
  name?: string; // Pour les cartes spéciales
}
