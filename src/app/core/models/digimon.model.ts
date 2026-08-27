/** Domain models mirroring the digi-api.com v1 responses. */

/** A single item in the paginated list endpoint. */
export interface DigimonSummary {
  readonly id: number;
  readonly name: string;
  readonly href: string;
  readonly image: string;
}

export interface Pageable {
  readonly currentPage: number;
  readonly elementsOnPage: number;
  readonly totalElements: number;
  readonly totalPages: number;
  readonly previousPage: string;
  readonly nextPage: string;
}

export interface DigimonListResponse {
  readonly content: readonly DigimonSummary[];
  readonly pageable: Pageable;
}

export interface DigimonImage {
  readonly href: string;
  readonly transparent: boolean;
}

export interface DigimonLevel {
  readonly id: number;
  readonly level: string;
}

export interface DigimonType {
  readonly id: number;
  readonly type: string;
}

export interface DigimonAttribute {
  readonly id: number;
  readonly attribute: string;
}

export interface DigimonField {
  readonly id: number;
  readonly field: string;
  readonly image: string;
}

export interface DigimonDescription {
  readonly origin: string;
  readonly language: string;
  readonly description: string;
}

export interface DigimonSkill {
  readonly id: number;
  readonly skill: string;
  readonly translation: string;
  readonly description: string;
}

export interface Evolution {
  readonly id: number;
  readonly digimon: string;
  readonly condition: string;
  readonly image: string;
  readonly url: string;
}

/** Full detail response. */
export interface Digimon {
  readonly id: number;
  readonly name: string;
  readonly xAntibody: boolean;
  readonly images: readonly DigimonImage[];
  readonly levels: readonly DigimonLevel[];
  readonly types: readonly DigimonType[];
  readonly attributes: readonly DigimonAttribute[];
  readonly fields: readonly DigimonField[];
  readonly releaseDate: string;
  readonly descriptions: readonly DigimonDescription[];
  readonly skills: readonly DigimonSkill[];
  readonly priorEvolutions: readonly Evolution[];
  readonly nextEvolutions: readonly Evolution[];
}

export interface RefField {
  readonly id: number;
  readonly name: string;
  readonly href: string;
}

export interface RefListResponse {
  readonly content: {
    readonly name: string;
    readonly description: string;
    readonly fields: readonly RefField[];
  };
  readonly pageable: Pageable;
}

/** Query parameters supported by the browse view. */
export interface BrowseQuery {
  readonly name: string;
  readonly attribute: string;
  readonly level: string;
  readonly xAntibody: boolean;
  readonly page: number;
}
