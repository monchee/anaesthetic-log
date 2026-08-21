import type { DrugProtocol } from '@features/testing/types';

export type ProtocolResolution =
  | {
      status: 'valid';
      protocol: DrugProtocol;
      index: number;
      isDefault: boolean;
    }
  | {
      status: 'invalid';
      protocol: undefined;
      index: unknown;
      reason: string;
    }
  | {
      status: 'empty';
      protocol: undefined;
      index: unknown;
      reason: string;
    };

/**
 * Resolves a protocol from a drug's protocol list against a requested index.
 *
 * CLINICAL SAFETY RULES:
 * - Missing / undefined index resolves to index 0 (the established default).
 * - Any non-integer, negative, or out-of-range value fails closed: returns
 *   status: 'invalid' so clinical UI and outbound formatters never guess a dose variant.
 * - An empty protocol array returns status: 'empty'.
 */
export function resolveSelectedProtocol(
  protocols: readonly DrugProtocol[] | DrugProtocol[] | undefined | null,
  selectedIndex: unknown
): ProtocolResolution {
  if (!protocols || !Array.isArray(protocols) || protocols.length === 0) {
    return {
      status: 'empty',
      protocol: undefined,
      index: selectedIndex,
      reason: 'No protocols available for drug',
    };
  }

  // Missing or undefined defaults to the first protocol (index 0)
  if (selectedIndex === undefined) {
    return {
      status: 'valid',
      protocol: protocols[0],
      index: 0,
      isDefault: true,
    };
  }

  // Fail closed on non-integers, null, strings, booleans, NaN, Infinity, etc.
  if (typeof selectedIndex !== 'number' || !Number.isInteger(selectedIndex)) {
    return {
      status: 'invalid',
      protocol: undefined,
      index: selectedIndex,
      reason: 'Protocol selection index must be an integer',
    };
  }

  // Fail closed on negative or out-of-range indices
  if (selectedIndex < 0 || selectedIndex >= protocols.length) {
    return {
      status: 'invalid',
      protocol: undefined,
      index: selectedIndex,
      reason: `Protocol selection index ${selectedIndex} is out of bounds (0..${protocols.length - 1})`,
    };
  }

  return {
    status: 'valid',
    protocol: protocols[selectedIndex],
    index: selectedIndex,
    isDefault: selectedIndex === 0,
  };
}
