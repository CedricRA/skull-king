import { Component, Input } from '@angular/core';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-info',
  standalone: true,
  imports: [],
  templateUrl: './player-info.html',
  styleUrls: ['./player-info.scss'],
})
export class PlayerInfo {
  @Input() player!: Player;
  @Input() isCurrent: boolean = false;
  @Input() lastTrickWinnerId: number | null = null;
}
