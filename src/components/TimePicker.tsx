import { useEffect, useRef } from "react";
import { IconChevronDown } from "./icons";

/**
 * Колёсный выбор времени в духе мобильных picker'ов:
 * две ленты (часы и минуты с шагом 5), скролл с доводкой,
 * стрелки для точной подстройки.
 */

const ITEM_H = 38;
const VISIBLE = 4; // видимых строк
const PAD = (ITEM_H * (VISIBLE - 1)) / 2;

const pad2 = (n: number) => String(n).padStart(2, "0");

function Wheel({
  items,
  index,
  onIndex,
  label,
}: {
  items: string[];
  index: number;
  onIndex: (i: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const endTimer = useRef<number | null>(null);
  const lock = useRef(false);

  // Подстройка под внешнее значение (не мешает ручному скроллу благодаря lock).
  useEffect(() => {
    const el = ref.current;
    if (!el || lock.current) return;
    if (Math.abs(el.scrollTop - index * ITEM_H) > 2) {
      el.scrollTo({ top: index * ITEM_H, behavior: "smooth" });
    }
  }, [index]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = index * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (i: number) => onIndex(Math.max(0, Math.min(items.length - 1, i)));

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    lock.current = true;
    const idx = Math.round(el.scrollTop / ITEM_H);
    if (idx !== index && idx >= 0 && idx < items.length) onIndex(idx);
    if (endTimer.current) window.clearTimeout(endTimer.current);
    endTimer.current = window.setTimeout(() => {
      const el2 = ref.current;
      if (!el2) return;
      const nearest = Math.max(0, Math.min(items.length - 1, Math.round(el2.scrollTop / ITEM_H)));
      el2.scrollTo({ top: nearest * ITEM_H, behavior: "smooth" });
      window.setTimeout(() => (lock.current = false), 260);
    }, 110);
  };

  const step = (d: number) => {
    lock.current = true;
    const ni = Math.max(0, Math.min(items.length - 1, index + d));
    onIndex(ni);
    ref.current?.scrollTo({ top: ni * ITEM_H, behavior: "smooth" });
    window.setTimeout(() => (lock.current = false), 300);
  };

  const arrow =
    "mx-auto flex h-6 w-10 items-center justify-center rounded-md text-gray-300 transition hover:text-accent active:scale-90 dark:text-gray-600";

  return (
    <div className="flex flex-col" role="group" aria-label={label}>
      <button className={arrow} onClick={() => step(-1)} aria-label="Раньше" tabIndex={-1}>
        <IconChevronDown size={16} className="rotate-180" />
      </button>
      <div className="relative w-[72px]">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-[34px] -translate-y-1/2 rounded-[10px] bg-accent-soft dark:bg-white/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[54px] rounded-t-[12px] bg-gradient-to-b from-white to-transparent dark:from-panel" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[54px] rounded-b-[12px] bg-gradient-to-t from-white to-transparent dark:from-panel" />
        <div
          ref={ref}
          onScroll={handleScroll}
          className="no-scrollbar relative z-10 overflow-y-auto"
          style={{ height: ITEM_H * VISIBLE, paddingTop: PAD, paddingBottom: PAD }}
        >
          {items.map((v, i) => (
            <div
              key={v}
              className={`flex items-center justify-center text-[17px] tabular-nums transition-colors duration-150 ${
                i === index
                  ? "font-bold text-accent-deep dark:text-white"
                  : "font-medium text-gray-300 dark:text-gray-600"
              }`}
              style={{ height: ITEM_H }}
            >
              {v}
            </div>
          ))}
        </div>
      </div>
      <button className={arrow} onClick={() => step(1)} aria-label="Позже" tabIndex={-1}>
        <IconChevronDown size={16} />
      </button>
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [hRaw, mRaw] = value.split(":").map(Number);
  const h = Number.isFinite(hRaw) ? hRaw : 8;
  const mIdx = Math.round((Number.isFinite(mRaw) ? mRaw : 0) / 5) % 12;

  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const mins = Array.from({ length: 12 }, (_, i) => pad2(i * 5));

  const set = (hi: number, mi: number) => onChange(`${pad2(hi)}:${pad2(mi * 5)}`);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Wheel items={hours} index={h} onIndex={(i) => set(i, mIdx)} label="Часы" />
      <span className="pb-1 text-[24px] font-bold text-gray-300 dark:text-gray-600">:</span>
      <Wheel items={mins} index={mIdx} onIndex={(i) => set(h, i)} label="Минуты" />
    </div>
  );
}
