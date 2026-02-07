/**
 * Undo Store
 * Manages undo actions for reversible operations
 */

import { create } from 'zustand';

export interface UndoAction {
  id: string;
  type: 'delete' | 'archive' | 'deactivate';
  entityType: 'announcements' | 'events' | 'members';
  items: any[];
  timestamp: number;
  expiresAt: number;
}

interface UndoStore {
  undoStack: UndoAction[];
  addUndoAction: (action: Omit<UndoAction, 'id' | 'timestamp' | 'expiresAt'>) => string;
  performUndo: (id: string) => UndoAction | null;
  removeAction: (id: string) => void;
  clearExpired: () => void;
}

const UNDO_TIMEOUT_MS = 30000; // 30 seconds

export const useUndoStore = create<UndoStore>((set, get) => ({
  undoStack: [],

  addUndoAction: (action) => {
    const id = `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const expiresAt = timestamp + UNDO_TIMEOUT_MS;

    const undoAction: UndoAction = {
      ...action,
      id,
      timestamp,
      expiresAt,
    };

    set((state) => ({
      undoStack: [...state.undoStack, undoAction],
    }));

    // Auto-remove after timeout
    setTimeout(() => {
      get().removeAction(id);
    }, UNDO_TIMEOUT_MS);

    return id;
  },

  performUndo: (id) => {
    const action = get().undoStack.find((a) => a.id === id);
    if (!action) return null;

    // Remove from stack
    get().removeAction(id);

    return action;
  },

  removeAction: (id) => {
    set((state) => ({
      undoStack: state.undoStack.filter((a) => a.id !== id),
    }));
  },

  clearExpired: () => {
    const now = Date.now();
    set((state) => ({
      undoStack: state.undoStack.filter((a) => a.expiresAt > now),
    }));
  },
}));

// Cleanup expired actions periodically
setInterval(() => {
  useUndoStore.getState().clearExpired();
}, 10000); // Every 10 seconds
