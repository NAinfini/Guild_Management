import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (message: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 6000, // Default 6 seconds
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, newToast.duration);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Convenience functions for common toast types
 */
export const toast = {
  success: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ message, severity: 'success', duration });
  },
  
  error: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ message, severity: 'error', duration });
  },
  
  warning: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ message, severity: 'warning', duration });
  },
  
  info: (message: string, duration?: number) => {
    useToastStore.getState().addToast({ message, severity: 'info', duration });
  },
  
  /**
   * Special handler for API errors
   */
  apiError: (error: any) => {
    let message = 'An unexpected error occurred';
    let duration = 6000;
    
    if (error?.message) {
      message = error.message;
    }
    
    // Special handling for rate limiting
    if (error?.statusCode === 429) {
      message = error.message || 'Too many requests. Please wait a moment before trying again.';
      duration = 8000; // Show longer for rate limits
    }
    
    useToastStore.getState().addToast({ message, severity: 'error', duration });
  },
};
