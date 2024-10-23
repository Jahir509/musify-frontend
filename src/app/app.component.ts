import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MusicPlayerComponent } from './music-player/music-player.component';
import { DarkModeComponent } from "./dark-mode/dark-mode.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MusicPlayerComponent, DarkModeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'musify-frontend';
}
