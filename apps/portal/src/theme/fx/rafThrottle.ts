type AnyFn = (...args: any[]) => void;

export type RafThrottled<T extends AnyFn> = ((...args: Parameters<T>) => void) & {
  cancel: () => void;
};

export function rafThrottle<T extends AnyFn>(callback: T): RafThrottled<T> {
  let frame: number | null = null;
  let pendingArgs: Parameters<T> | null = null;

  const flush = () => {
    frame = null;
    if (!pendingArgs) return;
    callback(...pendingArgs);
    pendingArgs = null;
  };

  const throttled = ((...args: Parameters<T>) => {
    pendingArgs = args;

    if (frame !== null) return;

    if (typeof window === 'undefined') {
      flush();
      return;
    }

    frame = window.requestAnimationFrame(flush);
  }) as RafThrottled<T>;

  throttled.cancel = () => {
    pendingArgs = null;

    if (frame === null || typeof window === 'undefined') {
      frame = null;
      return;
    }

    window.cancelAnimationFrame(frame);
    frame = null;
  };

  return throttled;
}

