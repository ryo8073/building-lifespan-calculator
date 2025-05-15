import { BuildingLifespanEntry } from '@/features/statutory-lifespan/types';
import { create } from 'zustand';

interface UsefulLifeState {
  usefulLifeEntry: BuildingLifespanEntry | null;
  setUsefulLifeEntry: (entry: BuildingLifespanEntry | null) => void;
}

export const useUsefulLifeStore = create<UsefulLifeState>((set) => ({
  usefulLifeEntry: null,
  setUsefulLifeEntry: (entry) => set({ usefulLifeEntry: entry }),
})); 