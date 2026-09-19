/**
 * Mock data loader — the single module responsible for fetching mock test data.
 *
 * In Phase 2 this file is the only place you need to touch:
 * swap the static JSON import with an API call or localStorage read.
 */
import type { MockTest } from '../types/mock';
import mocksData from '../data/mocks.json';

/** Fetch all available mock tests. */
export function getMockTests(): MockTest[] {
  return mocksData as MockTest[];
}

/** Fetch a single mock test by its id. Returns `undefined` when not found. */
export function getMockTestById(id: string): MockTest | undefined {
  return getMockTests().find((m) => m.id === id);
}
