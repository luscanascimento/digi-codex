import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Digimon, Evolution } from '../../core/models/digimon.model';
import { EvolutionIdPipe } from '../../shared/pipes/evolution-id.pipe';

interface TreeNode {
  readonly id: number | null;
  readonly name: string;
  readonly image: string;
  readonly condition: string;
}

/**
 * Digivolution Tree.
 * Renders prior -> current -> next evolution forms as an interactive,
 * CSS-node graph with SVG connectors. Every node is a link that navigates
 * to that Digimon's detail page.
 */
@Component({
  selector: 'app-digivolution-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './digivolution-tree.html',
  styleUrl: './digivolution-tree.scss',
})
export class DigivolutionTree {
  readonly digimon = input.required<Digimon>();

  private readonly evoId = new EvolutionIdPipe();

  private toNode = (e: Evolution): TreeNode => ({
    id: this.evoId.transform(e.url),
    name: e.digimon,
    image: e.image,
    condition: e.condition,
  });

  readonly prior = computed<readonly TreeNode[]>(() =>
    this.digimon().priorEvolutions.map(this.toNode),
  );
  readonly next = computed<readonly TreeNode[]>(() =>
    this.digimon().nextEvolutions.map(this.toNode),
  );

  readonly current = computed<TreeNode>(() => {
    const d = this.digimon();
    return {
      id: d.id,
      name: d.name,
      image: d.images[0]?.href ?? '',
      condition: '',
    };
  });

  readonly hasTree = computed(() => this.prior().length > 0 || this.next().length > 0);

  /** Collapse long branches by default; user can expand. */
  private readonly _expanded = signal(false);
  readonly expanded = this._expanded.asReadonly();
  readonly maxCollapsed = 4;

  readonly priorShown = computed(() =>
    this._expanded() ? this.prior() : this.prior().slice(0, this.maxCollapsed),
  );
  readonly nextShown = computed(() =>
    this._expanded() ? this.next() : this.next().slice(0, this.maxCollapsed),
  );
  readonly hiddenCount = computed(() => {
    const hidden =
      Math.max(0, this.prior().length - this.maxCollapsed) +
      Math.max(0, this.next().length - this.maxCollapsed);
    return hidden;
  });

  toggleExpand(): void {
    this._expanded.update((v) => !v);
  }
}
