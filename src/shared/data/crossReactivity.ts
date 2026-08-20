import rawSnapshot from './protocols.snapshot.json';

export interface CrossReactivityItem {
  readonly category: string;
  readonly info: string;
  readonly alternatives: string;
}

export interface CrossReactivityGovernance {
  readonly version: string;
  readonly last_reviewed: string;
  readonly reviewed_by: string;
  readonly under_review: boolean;
  readonly provenance: string;
}

export interface ParsedCrossReactivity {
  readonly governance: CrossReactivityGovernance;
  readonly items: readonly CrossReactivityItem[];
}

export function parseCrossReactivitySnapshot(snapshot: unknown): ParsedCrossReactivity {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('Missing or invalid cross_reactivity: expected a non-null snapshot object.');
  }

  const raw = snapshot as Record<string, unknown>;
  if (typeof raw.schema_version !== 'string' || raw.schema_version !== '1.1') {
    throw new Error(
      `Unsupported or missing schema_version "${String(raw.schema_version)}". Cross-reactivity requires schema_version "1.1".`
    );
  }

  if (!raw.cross_reactivity || typeof raw.cross_reactivity !== 'object') {
    throw new Error('Missing or invalid cross_reactivity object in protocols snapshot.');
  }

  const cr = raw.cross_reactivity as Record<string, unknown>;

  if (typeof cr.under_review !== 'boolean') {
    throw new Error('Malformed cross_reactivity: under_review must be a boolean.');
  }

  if (typeof cr.version !== 'string') {
    throw new Error('Malformed cross_reactivity: version must be a string.');
  }
  if (!cr.version.trim()) {
    throw new Error('Malformed cross_reactivity: version must be a non-empty string.');
  }

  if (typeof cr.provenance !== 'string') {
    throw new Error('Malformed cross_reactivity: provenance must be a string.');
  }
  if (!cr.provenance.trim()) {
    throw new Error('Malformed cross_reactivity: provenance must be a non-empty string.');
  }

  if (typeof cr.last_reviewed !== 'string') {
    throw new Error('Malformed cross_reactivity: last_reviewed must be a string.');
  }
  if (!cr.under_review && !cr.last_reviewed.trim()) {
    throw new Error(
      'Malformed cross_reactivity: last_reviewed must be a non-empty string when under_review is false.'
    );
  }

  if (typeof cr.reviewed_by !== 'string') {
    throw new Error('Malformed cross_reactivity: reviewed_by must be a string.');
  }
  if (!cr.under_review && !cr.reviewed_by.trim()) {
    throw new Error(
      'Malformed cross_reactivity: reviewed_by must be a non-empty string when under_review is false.'
    );
  }

  if (!Array.isArray(cr.items)) {
    throw new Error('Malformed cross_reactivity: items must be an array.');
  }

  if (cr.items.length === 0) {
    throw new Error('Malformed cross_reactivity: items array is empty.');
  }

  const parsedItems: CrossReactivityItem[] = cr.items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Malformed item at index ${index}: expected an object.`);
    }

    const { category, info, alternatives } = item as Record<string, unknown>;

    if (
      typeof category !== 'string' ||
      !category.trim() ||
      typeof info !== 'string' ||
      !info.trim() ||
      typeof alternatives !== 'string' ||
      !alternatives.trim()
    ) {
      throw new Error(
        `Malformed item at index ${index}: category, info, and alternatives must be non-empty strings.`
      );
    }

    return {
      category,
      info,
      alternatives,
    };
  });

  const governance: CrossReactivityGovernance = {
    version: cr.version,
    last_reviewed: cr.last_reviewed,
    reviewed_by: cr.reviewed_by,
    under_review: cr.under_review,
    provenance: cr.provenance,
  };

  return {
    governance,
    items: parsedItems,
  };
}

// Parse pinned snapshot at module load; fail loudly if missing or malformed
const parsed = parseCrossReactivitySnapshot(rawSnapshot);

export const CROSS_REACTIVITY_ITEMS: readonly CrossReactivityItem[] = parsed.items;
export const CROSS_REACTIVITY_GOVERNANCE: Readonly<CrossReactivityGovernance> = parsed.governance;
