import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Route } from "./types";

/**
 * Простой стек навигации с анимацией «выезда» верхнего экрана.
 * Главный экран всегда в основании стека.
 */

interface NavValue {
  stack: Route[];
  /** true, пока верхний экран проигрывает анимацию закрытия */
  closing: boolean;
  push: (r: Route) => void;
  pop: () => void;
  /** Мгновенно вернуться к главному экрану (например, после удаления урока). */
  resetToMain: () => void;
}

const NavCtx = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ type: "main" }]);
  const [closing, setClosing] = useState(false);
  const timer = useRef<number | null>(null);

  const push = useCallback((r: Route) => {
    if (timer.current) window.clearTimeout(timer.current);
    setClosing(false);
    setStack((s) => [...s, r]);
  }, []);

  const pop = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s;
      setClosing(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setStack((cur) => cur.slice(0, -1));
        setClosing(false);
      }, 290);
      return s;
    });
  }, []);

  const resetToMain = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setClosing(false);
    setStack([{ type: "main" }]);
  }, []);

  const value = useMemo(
    () => ({ stack, closing, push, pop, resetToMain }),
    [stack, closing, push, pop, resetToMain],
  );

  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}

export function useNav(): NavValue {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error("useNav вне NavProvider");
  return ctx;
}
