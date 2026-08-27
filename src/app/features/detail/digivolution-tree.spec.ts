import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DigivolutionTree } from './digivolution-tree';
import { Digimon, Evolution } from '../../core/models/digimon.model';

function evolution(partial: Partial<Evolution>): Evolution {
  return { id: 0, digimon: 'X', condition: '', image: '', url: '', ...partial } as Evolution;
}

function digimon(partial: Partial<Digimon>): Digimon {
  return {
    id: 1,
    name: 'Agumon',
    images: [{ href: 'a.png' }],
    priorEvolutions: [],
    nextEvolutions: [],
    ...partial,
  } as Digimon;
}

async function render(d: Digimon): Promise<DigivolutionTree> {
  await TestBed.configureTestingModule({
    imports: [DigivolutionTree],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(DigivolutionTree);
  fixture.componentRef.setInput('digimon', d);
  await fixture.whenStable();
  return fixture.componentInstance;
}

describe('DigivolutionTree node ids', () => {
  it('takes the id straight off the evolution payload, not off its url', async () => {
    const tree = await render(
      digimon({
        nextEvolutions: [evolution({ id: 87, digimon: 'Greymon', url: 'https://digi-api.com/x' })],
      }),
    );

    expect(tree.next().map((n) => n.id)).toEqual([87]);
  });

  it('renders a node with no id as a static node instead of a link', async () => {
    const tree = await render(
      digimon({
        priorEvolutions: [evolution({ id: undefined as unknown as number, digimon: 'Koromon' })],
      }),
    );

    expect(tree.prior().map((n) => n.id)).toEqual([null]);
  });
});
