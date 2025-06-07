import { Component, Input } from '@angular/core';
import { Card as CardModel } from '../../models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() card!: CardModel;
}
