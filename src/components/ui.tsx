import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { IconCheck, IconClose } from "./icons";

/* ---------- Хук: отложенный unmount для анимаций закрытия ---------- */

export function useDelayedUnmount(open: boolean, ms = 250) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ms]);
  return { mounted, closing };
}

/* ---------- Нижняя шторка (bottom sheet) ---------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const { mounted, closing } = useDelayedUnmount(open, 260);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-[#08131a]/50 transition-opacity duration-200 ${
          closing ? "opacity-0" : "opacity-100 anim-fade"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[88%] overflow-hidden rounded-t-[22px] bg-white shadow-[0_-10px_40px_rgba(8,19,26,0.25)] dark:bg-panel dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${
          closing ? "anim-sheet-down" : "anim-sheet-up"
        }`}
      >
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-9 rounded-full bg-black/15 dark:bg-white/20" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <h2 className="font-display text-[15px] font-semibold tracking-tight text-ink dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-black/5 hover:text-ink active:scale-90 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Закрыть"
            >
              <IconClose size={18} />
            </button>
          </div>
        )}
        <div className="max-h-[76vh] overflow-y-auto no-scrollbar px-5 pb-6 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- Диалог подтверждения ---------- */

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { mounted, closing } = useDelayedUnmount(open, 180);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-7">
      <div
        className={`absolute inset-0 bg-[#08131a]/55 transition-opacity duration-200 ${
          closing ? "opacity-0" : "opacity-100 anim-fade"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative w-full rounded-[18px] bg-white p-5 shadow-2xl dark:bg-panel ${
          closing ? "opacity-0 scale-95 transition-all duration-150" : "anim-pop"
        }`}
      >
        <h3 className="text-[17px] font-bold text-ink dark:text-white">{title}</h3>
        <div className="mt-2 text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">
          {children}
        </div>
        <div className="mt-5 flex justify-end gap-1.5">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[14px] font-semibold text-accent transition hover:bg-accent-soft active:scale-95 dark:hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-danger/10 px-4 py-2 text-[14px] font-bold text-danger transition hover:bg-danger/15 active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Тосты ---------- */

interface ToastItem {
  id: number;
  text: string;
}

const ToastCtx = createContext<{ toast: (text: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast вне ToastProvider");
  return ctx;
}

let toastSeq = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((text: string) => {
    const id = toastSeq++;
    setItems((s) => [...s.slice(-2), { id, text }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 2400);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[90] flex flex-col items-center gap-2 px-6">
        {items.map((i) => (
          <div
            key={i.id}
            className="anim-toast flex max-w-full items-center gap-2.5 rounded-full bg-[#10242e]/95 py-2.5 pl-3 pr-4 text-[13.5px] font-medium text-white shadow-xl backdrop-blur dark:bg-white/95 dark:text-ink"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-done/90 text-white">
              <IconCheck size={12} sw={3} />
            </span>
            <span className="truncate">{i.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Пустое состояние ---------- */

export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="anim-pop flex flex-col items-center px-8 py-14 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-accent/10 text-accent dark:bg-accent/15">
        {icon}
      </div>
      <h3 className="mt-5 text-[16px] font-bold text-ink dark:text-white">{title}</h3>
      {text && (
        <p className="mt-1.5 max-w-[260px] text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400">
          {text}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
