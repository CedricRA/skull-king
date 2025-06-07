import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, PlayedCard } from '../models/game-state.model';
import { Player } from '../models/player.model';
import { Card, CardColor } from '../models/card.model';

function createDeck(): Card[] {
  const colors: CardColor[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  let id = 1;
  const deck: Card[] = [];
  for (const color of colors) {
    for (let value = 1; value <= 14; value++) {
      deck.push({ id: id++, color, value });
    }
  }
  // Cartes spéciales
  for (let i = 0; i < 5; i++)
    deck.push({ id: id++, color: 'escape', name: 'Escape' });
  for (let i = 0; i < 5; i++)
    deck.push({ id: id++, color: 'pirate', name: 'Pirate' });
  deck.push({ id: id++, color: 'skullking', name: 'Skull King' });
  deck.push({ id: id++, color: 'mermaid', name: 'Mermaid' });
  deck.push({ id: id++, color: 'scarymary', name: 'Scary Mary' });
  return deck;
}

@Injectable({ providedIn: 'root' })
export class Game {
  private state$ = new BehaviorSubject<GameState>(this.initGameState());

  get gameState$() {
    return this.state$.asObservable();
  }

  private isSuitCardColor = (color: CardColor) =>
    ['spades', 'hearts', 'diamonds', 'clubs'].includes(color);

  private isSpecialCardColor = (color: CardColor) =>
    ['pirate', 'skullking', 'mermaid', 'escape', 'scarymary'].includes(color);

  private initGameState(): GameState {
    const players: Player[] = [
      { id: 1, name: 'Player 1', hand: [], score: 0, bid: 0, tricks: 0 },
      { id: 2, name: 'Player 2', hand: [], score: 0, bid: 0, tricks: 0 },
      { id: 3, name: 'Player 3', hand: [], score: 0, bid: 0, tricks: 0 },
      { id: 4, name: 'Player 4', hand: [], score: 0, bid: 0, tricks: 0 },
    ];
    return {
      round: 1,
      players,
      playedCards: [],
      currentPlayerId: 1,
      cardsThisRound: 1,
      phase: 'bidding',
      lastTrickWinnerId: null,
      lastTrickWinningCardId: null,
      biddingConfirmed: false,
    };
  }

  startNewRound() {
    const state = this.state$.getValue();
    const deck = this.shuffle(createDeck());
    const cardsThisRound = state.round;
    const players = state.players.map((p, i) => {
      const hand = deck.slice(i * cardsThisRound, (i + 1) * cardsThisRound);
      let bid = 0;
      if (p.id !== 1) {
        // IA players
        bid = Math.floor(Math.random() * (cardsThisRound + 1)); // Random bid for AI
      }
      return {
        ...p,
        hand,
        bid,
        tricks: 0,
      };
    });
    this.state$.next({
      ...state,
      round: state.round + 1,
      players,
      playedCards: [],
      currentPlayerId: 1,
      cardsThisRound: cardsThisRound + 1,
      phase: 'bidding',
      lastTrickWinnerId: null,
      lastTrickWinningCardId: null,
      biddingConfirmed: false,
    });
  }

  private shuffle<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  playCard(cardToPlay: Card) {
    const state = this.state$.getValue();

    const currentPlayer = state.players.find(
      (p) => p.id === state.currentPlayerId
    );
    if (!currentPlayer) return;

    // Remove card from current player's hand
    const newHand = currentPlayer.hand.filter((c) => c.id !== cardToPlay.id);

    // Create a deep copy of players and update current player's hand
    const updatedPlayers = state.players.map((p) => {
      if (p.id === state.currentPlayerId) {
        return { ...p, hand: [...newHand] };
      }
      return { ...p, hand: [...p.hand] };
    });

    // Add the played card to the board
    let playedCards: PlayedCard[];
    let lastTrickWinnerId: number | null = null;
    let lastTrickWinningCardId: number | null = null;

    // Vider le plateau si le joueur humain commence un nouveau pli et qu'il y a des cartes du pli précédent
    if (currentPlayer.id === 1 && state.playedCards.length > 0) {
      playedCards = [];
      lastTrickWinnerId = null; // Reset winner info when clearing plateau
      lastTrickWinningCardId = null; // Reset winner info when clearing plateau
    } else {
      playedCards = [...state.playedCards];
      lastTrickWinnerId = state.lastTrickWinnerId;
      lastTrickWinningCardId = state.lastTrickWinningCardId;
    }

    playedCards.push({ playerId: currentPlayer.id, card: cardToPlay });

    // Determine the next player
    const nextPlayerIndex =
      (state.players.findIndex((p) => p.id === state.currentPlayerId) + 1) %
      state.players.length;
    const nextPlayerId = state.players[nextPlayerIndex].id;

    // Update the game state
    this.state$.next({
      ...state,
      playedCards,
      players: updatedPlayers,
      currentPlayerId: nextPlayerId,
      phase: 'playing',
      lastTrickWinnerId,
      lastTrickWinningCardId,
    });

    this._handleNextTurn();
  }

  private _handleNextTurn() {
    const state = this.state$.getValue();

    // Si toutes les cartes du pli ont été jouées
    if (state.playedCards.length === state.players.length) {
      const winnerId = this.resolveTrick(state.playedCards);
      const players = state.players.map((p) => ({ ...p, hand: [...p.hand] }));
      const winner = players.find((p) => p.id === winnerId);
      if (winner) winner.tricks += 1;

      const winningPlayedCard = state.playedCards.find(
        (pc) => pc.playerId === winnerId
      );

      setTimeout(() => {
        const isEndRound = players.every((p) => p.hand.length === 0);
        if (isEndRound) {
          this._calculateRoundScores(players);
        }
        this.state$.next({
          ...state,
          players,
          playedCards: [],
          phase: isEndRound ? 'end-round' : 'playing',
          currentPlayerId: state.players[0].id,
          lastTrickWinnerId: winnerId,
          lastTrickWinningCardId: winningPlayedCard
            ? winningPlayedCard.card.id
            : null,
        });
      }, 1500); // Laisse le temps de voir le pli résolu avant de le vider
      return;
    }

    // Si le prochain joueur est une IA, simuler son tour
    const currentPlayer = state.players.find(
      (p) => p.id === state.currentPlayerId
    );
    if (currentPlayer && currentPlayer.id !== 1) {
      setTimeout(() => {
        if (currentPlayer.hand.length > 0) {
          const playableCards = this.getPlayableCards(
            currentPlayer.hand,
            state.playedCards
          );
          if (playableCards.length > 0) {
            const randomIdx = Math.floor(Math.random() * playableCards.length);
            const aiCard = playableCards[randomIdx];
            this.playCard(aiCard);
          } else {
            console.warn("AI has no playable cards, this shouldn't happen.");
          }
        }
      }, 700); // Délai pour que les cartes apparaissent une par une
    }
    // Si c'est le joueur humain, on ne fait rien, on attend son action
  }

  public getPlayableCards(
    playerHand: Card[],
    playedCards: PlayedCard[]
  ): Card[] {
    if (playedCards.length === 0) {
      // Si aucune carte n'a été jouée, toutes les cartes peuvent être jouées
      return playerHand;
    }

    const firstCardInTrick = playedCards[0].card;
    let trickLeadColor: CardColor | null = null;

    if (this.isSuitCardColor(firstCardInTrick.color)) {
      trickLeadColor = firstCardInTrick.color;
    } else if (this.isSpecialCardColor(firstCardInTrick.color)) {
      // Si la première carte est spéciale, la première carte de couleur jouée détermine la couleur demandée
      const firstColorCard = playedCards.find((pc) =>
        this.isSuitCardColor(pc.card.color)
      );
      if (firstColorCard) {
        trickLeadColor = firstColorCard.card.color;
      }
    }

    // S'il n'y a pas de couleur demandée (ex: toutes les cartes spéciales jouées ou première carte spéciale sans couleur de suite)
    if (!trickLeadColor) {
      return playerHand; // Toutes les cartes peuvent être jouées
    }

    // S'il y a une couleur demandée
    const cardsOfLeadColorInHand = playerHand.filter(
      (card) =>
        this.isSuitCardColor(card.color) && card.color === trickLeadColor
    );
    const specialCardsInHand = playerHand.filter((card) =>
      this.isSpecialCardColor(card.color)
    );

    if (cardsOfLeadColorInHand.length > 0) {
      // Le joueur a des cartes de la couleur demandée, il DOIT jouer l'une d'elles ou une carte spéciale.
      return [...cardsOfLeadColorInHand, ...specialCardsInHand];
    } else {
      // Le joueur n'a PAS de cartes de la couleur demandée, il peut jouer N'IMPORTE quelle carte.
      return playerHand;
    }
  }

  // Règles simplifiées du Skull King pour la prise de pli
  resolveTrick(playedCards: PlayedCard[]): number {
    // 1. Skull King > Pirate > Mermaid > Couleur demandée > Autres
    // 2. Si plusieurs cartes de la couleur demandée, la plus forte l'emporte
    // 3. Si plusieurs pirates, le premier l'emporte
    // 4. Si Skull King + Pirate, Pirate l'emporte
    // 5. Si Skull King + Mermaid, Mermaid l'emporte
    // 6. Si que des évasions, le premier l'emporte
    const order = [
      'skullking',
      'pirate',
      'mermaid',
      'spades',
      'hearts',
      'diamonds',
      'clubs',
      'escape',
      'scarymary',
    ];
    const firstCard = playedCards[0].card;
    // Couleur demandée
    let leadColor = firstCard.color;
    if (
      leadColor === 'pirate' ||
      leadColor === 'skullking' ||
      leadColor === 'mermaid' ||
      leadColor === 'escape' ||
      leadColor === 'scarymary'
    ) {
      // Si la première carte est spéciale, la première couleur classique jouée devient la couleur demandée
      const firstColorCard = playedCards.find((pc) =>
        ['spades', 'hearts', 'diamonds', 'clubs'].includes(pc.card.color)
      );
      if (firstColorCard) leadColor = firstColorCard.card.color;
    }
    // Cas Skull King + Pirate + Mermaid
    const hasSkullKing = playedCards.some(
      (pc) => pc.card.color === 'skullking'
    );
    const pirates = playedCards.filter((pc) => pc.card.color === 'pirate');
    const hasMermaid = playedCards.some((pc) => pc.card.color === 'mermaid');

    // Ordre de priorité : Mermaid > Skull King > Pirate > Couleur demandée > Autres

    if (hasSkullKing && hasMermaid) {
      // Mermaid bat Skull King
      return playedCards.find((pc) => pc.card.color === 'mermaid')!.playerId;
    }
    if (hasSkullKing && pirates.length > 0) {
      // Skull King bat Pirate
      return playedCards.find((pc) => pc.card.color === 'skullking')!.playerId;
    }
    if (pirates.length > 0) {
      // Premier pirate l'emporte
      return pirates[0].playerId;
    }
    if (hasSkullKing) {
      return playedCards.find((pc) => pc.card.color === 'skullking')!.playerId;
    }
    if (hasMermaid) {
      return playedCards.find((pc) => pc.card.color === 'mermaid')!.playerId;
    }
    // Couleur demandée : la plus forte valeur l'emporte
    const colorCards = playedCards.filter((pc) => pc.card.color === leadColor);
    if (colorCards.length > 0) {
      return colorCards.reduce((max, pc) =>
        !max || (pc.card.value ?? 0) > (max.card.value ?? 0) ? pc : max
      ).playerId;
    }
    // Si que des évasions ou scary mary, le premier l'emporte
    return playedCards[0].playerId;
  }

  setPlayerBid(playerId: number, bid: number) {
    const state = this.state$.getValue();
    const updatedPlayers = state.players.map((p) => {
      if (p.id === playerId) {
        return { ...p, bid };
      }
      return { ...p };
    });
    this.state$.next({
      ...state,
      players: updatedPlayers,
      // Ne pas changer la phase ici, c'est géré par confirmBid()
    });
  }

  private _calculateRoundScores(players: Player[]): void {
    const state = this.state$.getValue(); // Get the current game state to access cardsThisRound
    players.forEach((p) => {
      let scoreChange = 0;
      if (p.bid === 0) {
        if (p.tricks === 0) {
          scoreChange = 10 * state.cardsThisRound; // Annoncé 0, fait 0 pli: 10 points * nombre de cartes
        } else {
          scoreChange = -10 * state.cardsThisRound; // Annoncé 0, fait des plis: -10 points * nombre de cartes
        }
      } else {
        // Annoncé X != 0
        if (p.tricks === p.bid) {
          scoreChange = 20 * p.tricks; // Annoncé X, fait X plis
        } else {
          scoreChange = -10 * Math.abs(p.tricks - p.bid); // Annoncé X, ne fait pas X plis
        }
      }
      p.score += scoreChange;
    });
  }

  confirmBid() {
    const state = this.state$.getValue();
    this.state$.next({
      ...state,
      biddingConfirmed: true,
      phase: 'playing', // Passe à la phase de jeu une fois l'annonce confirmée
    });
  }
}
