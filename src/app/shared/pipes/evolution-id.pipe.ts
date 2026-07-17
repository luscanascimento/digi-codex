import { Pipe, PipeTransform } from '@angular/core';

/** Extracts the trailing numeric id from a digi-api resource url. */
@Pipe({ name: 'evolutionId' })
export class EvolutionIdPipe implements PipeTransform {
  transform(url: string): number | null {
    const match = /\/(\d+)\/?$/.exec(url ?? '');
    return match ? Number(match[1]) : null;
  }
}
