import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites';
import { DigimonCard } from '../../shared/ui/digimon-card';

@Component({
  selector: 'app-favorites-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DigimonCard],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesService);
}
