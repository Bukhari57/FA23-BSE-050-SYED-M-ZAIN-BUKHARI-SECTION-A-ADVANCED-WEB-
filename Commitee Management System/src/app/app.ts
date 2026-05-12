import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { resolveApiOrigin } from './core/config/runtime-config';
import { RealtimeService } from './core/services/realtime.service';
import { AuthStore } from './core/state/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly realtimeService = inject(RealtimeService);

  constructor() {
    this.authStore.hydrate();

    effect(() => {
      const user = this.authStore.user();
      if (user) {
        const origin = resolveApiOrigin(environment.apiBaseUrl);
        this.realtimeService.connect(origin, user.id);
      } else {
        this.realtimeService.disconnect();
      }
    });
  }
}
