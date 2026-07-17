import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder tile shown while the browse grid is loading. */
@Component({
  selector: 'app-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sk" [style.--i]="index()" aria-hidden="true">
      <div class="sk__frame"></div>
      <div class="sk__line sk__line--lg"></div>
      <div class="sk__actions">
        <span class="sk__pill"></span>
        <span class="sk__pill"></span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sk {
        border-radius: var(--r-lg);
        border: 1px solid var(--border);
        background: var(--surface);
        padding: var(--sp-3);
        animation: fade 0.4s var(--ease) backwards;
        animation-delay: calc(var(--i, 0) * 30ms);
      }
      .sk__frame,
      .sk__line,
      .sk__pill {
        background: linear-gradient(
          100deg,
          color-mix(in srgb, var(--surface-hi) 40%, transparent) 30%,
          color-mix(in srgb, var(--accent) 10%, transparent) 50%,
          color-mix(in srgb, var(--surface-hi) 40%, transparent) 70%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        border-radius: var(--r-md);
      }
      .sk__frame {
        aspect-ratio: 1;
      }
      .sk__line {
        height: 0.9rem;
        margin-top: var(--sp-3);
        border-radius: var(--r-pill);
      }
      .sk__line--lg {
        width: 70%;
      }
      .sk__actions {
        display: flex;
        gap: var(--sp-2);
        margin-top: var(--sp-3);
      }
      .sk__pill {
        width: 34px;
        height: 34px;
        border-radius: 10px;
      }
      @keyframes shimmer {
        to {
          background-position: -200% 0;
        }
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
      }
    `,
  ],
})
export class CardSkeleton {
  readonly index = input(0);
}
