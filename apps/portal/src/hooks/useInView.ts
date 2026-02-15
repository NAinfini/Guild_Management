import { useEffect, useRef, useState } from 'react';

export interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean;
}

/**
 * Emits an in-view boolean for the attached element.
 * By default it triggers once and disconnects to keep scroll animations inexpensive.
 */
export function useInView<T extends HTMLElement = HTMLElement>(options?: UseInViewOptions) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  const once = options?.once ?? true;
  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin ?? '0px';
  const threshold = options?.threshold ?? 0.1;
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [once, root, rootMargin, threshold, thresholdKey]);

  return [ref, inView] as const;
}

