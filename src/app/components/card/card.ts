import { Component, Input } from '@angular/core';
import { Card as CardModel } from '../../models/card.model';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() card!: CardModel;
}
