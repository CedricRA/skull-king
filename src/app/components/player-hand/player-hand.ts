import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  NgFor,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { Card } from '../../models/card.model';
import { Card as CardComponent } from '../card/card';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, CardComponent],
  templateUrl: './player-hand.html',
  styleUrls: ['./player-hand.scss'],
})
export class PlayerHand {
  @Input() hand: Card[] = [];
  @Input() cardsPlayable: boolean = true;
  @Output() cardClicked = new EventEmitter<Card>();

  onCardClick(card: Card) {
    this.cardClicked.emit(card);
  }

  trackByCardId(index: number, card: Card): number {
    return card.id;
  }
}
