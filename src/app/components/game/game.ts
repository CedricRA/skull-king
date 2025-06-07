import { Component } from '@angular/core';
import { PlayedCards } from '../played-cards/played-cards';
import { PlayerInfo } from '../player-info/player-info';
import { PlayerHand } from '../player-hand/player-hand';
import { AsyncPipe } from '@angular/common';
import { Game as GameService } from '../../services/game';
import { GameState } from '../../models/game-state.model';
import { Observable } from 'rxjs';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [PlayedCards, PlayerInfo, PlayerHand, AsyncPipe],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
})
export class Game {
  gameState$: Observable<GameState>;

  constructor(public gameService: GameService) {
    this.gameState$ = this.gameService.gameState$;
    this.gameService.startNewRound();
  }

  getCurrentPlayerName(state: GameState): string {
    const player = state.players.find((p) => p.id === state.currentPlayerId);
    return player ? player.name : '';
  }

  getCurrentPlayerHand(state: GameState) {
    const humanPlayer = state.players.find((p) => p.id === 1);
    const hand = humanPlayer ? humanPlayer.hand : [];
    console.log('Current Player Hand (Human Player):', hand);
    return hand;
  }

  onCardPlayed(card: Card) {
    this.gameService.playCard(card);
  }

  getBidOptions(cardsThisRound: number): number[] {
    const options = [];
    const maxBid = cardsThisRound === 1 ? 1 : cardsThisRound;
    for (let i = 0; i <= maxBid; i++) {
      options.push(i);
    }
    return options;
  }

  getPlayerBid(state: GameState): number {
    const humanPlayer = state.players.find((p) => p.id === 1);
    return humanPlayer ? humanPlayer.bid : 0;
  }

  confirmBid() {
    this.gameService.confirmBid();
  }
}
