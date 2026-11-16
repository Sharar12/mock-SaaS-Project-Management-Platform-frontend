import { WorkspaceBundle } from '@/contracts';
import { SEED_DATA } from './seed';

const STORAGE_KEY = 'orbitflow_mock_db_v1';

function cloneSeed(): WorkspaceBundle {
  return JSON.parse(JSON.stringify(SEED_DATA)) as WorkspaceBundle;
}

export function readMockDb(): WorkspaceBundle {
  if (typeof window === 'undefined') {
    return cloneSeed();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = cloneSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as WorkspaceBundle;
  } catch {
    return cloneSeed();
  }
}

export function writeMockDb(bundle: WorkspaceBundle): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  } catch {
    // Ignore quota errors in restricted environments
  }
}

export function resetMockDb(): WorkspaceBundle {
  const initial = cloneSeed();
  writeMockDb(initial);
  return initial;
}
