import { Component } from '@angular/core';
import { Game } from './components/game/game';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Game],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected title = 'skull-king-ui';
}
