import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { PlayedCard, Player } from '../../models/game-state.model';
import { Card as CardComponent } from '../card/card';

@Component({
  selector: 'app-played-cards',
  standalone: true,
  imports: [NgFor, NgIf, CardComponent],
  templateUrl: './played-cards.html',
  styleUrls: ['./played-cards.scss'],
})
export class PlayedCards {
  @Input() playedCards: PlayedCard[] = [];
  @Input() players: Player[] = [];
  @Input() lastTrickWinnerId: number | null = null;
  @Input() lastTrickWinningCardId: number | null = null;

  ngOnChanges() {
    console.log('PlayedCards received update:', this.playedCards);
  }

  getPlayedCard(playerId: number) {
    return this.playedCards.find((pc) => pc.playerId === playerId);
  }
}
