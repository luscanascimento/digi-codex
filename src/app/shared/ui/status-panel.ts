import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type StatusKind = 'empty' | 'error';

/** Reusable empty / error state block used across async data paths. */
@Component({
  selector: 'app-status-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status glass" [class.status--error]="kind() === 'error'" role="status">
      <div class="status__glyph" aria-hidden="true">
        @if (kind() === 'error') {
          <svg
            viewBox="0 0 24 24"
            width="34"
            height="34"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <path d="M12 3 2 20h20L12 3Z" stroke-linejoin="round" />
            <path d="M12 10v5M12 17.5v.5" stroke-linecap="round" />
          </svg>
        } @else {
          <svg
            viewBox="0 0 24 24"
            width="34"
            height="34"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
          </svg>
        }
      </div>
      <h3 class="status__title">{{ title() }}</h3>
      <p class="status__msg">{{ message() }}</p>
      @if (kind() === 'error') {
        <button type="button" class="status__retry" (click)="retry.emit()">Retry connection</button>
      }
    </div>
  `,
  styles: [
    `
      .status {
        display: grid;
        justify-items: center;
        text-align: center;
        gap: var(--sp-3);
        padding: var(--sp-7) var(--sp-5);
        max-width: 460px;
        margin-inline: auto;
      }
      .status__glyph {
        display: grid;
        place-items: center;
        width: 68px;
        height: 68px;
        border-radius: 50%;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        border: 1px solid var(--border-hi);
      }
      .status--error .status__glyph {
        color: var(--danger);
        background: color-mix(in srgb, var(--danger) 14%, transparent);
        border-color: color-mix(in srgb, var(--danger) 45%, transparent);
      }
      .status__title {
        font-size: var(--fs-lg);
      }
      .status__msg {
        color: var(--text-1);
        margin: 0;
        font-size: var(--fs-sm);
      }
      .status__retry {
        margin-top: var(--sp-2);
        padding: 0.6rem 1.4rem;
        border-radius: var(--r-pill);
        border: 1px solid var(--border-hi);
        background: color-mix(in srgb, var(--accent) 16%, transparent);
        color: var(--text-0);
        font-weight: 600;
        letter-spacing: 0.02em;
        transition:
          transform var(--dur) var(--ease),
          background var(--dur) var(--ease);
      }
      .status__retry:hover {
        transform: translateY(-2px);
        background: color-mix(in srgb, var(--accent) 28%, transparent);
      }
    `,
  ],
})
export class StatusPanel {
  readonly kind = input.required<StatusKind>();
  readonly title = input.required<string>();
  readonly message = input('');
  readonly retry = output<void>();
}
