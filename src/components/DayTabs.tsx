import { useEffect, useRef } from "react";
import type { Lesson, Weekday } from "../types";
import { todayWeekday, weekdayShort } from "../utils/date";

/**
 * Верхняя панель «папок»: Все | Сегодня • Пн | Вт | …
 * Порядок дней начинается с сегодняшнего и идёт по кругу.
 */
export function DayTabs({
  selected,
  onSelect,
  lessons,
  pendingByDay,
}: {
  selected: Weekday | "all";
  onSelect: (v: Weekday | "all") => void;
  lessons: Lesson[];
  /** Число невыполненных заданий, «принадлежащих» каждому дню недели. */
  pendingByDay?: Record<number, number>;
}) {
  const today = todayWeekday();
  const order: Weekday[] = Array.from(
    { length: 7 },
    (_, i) => ((((today - 1 + i) % 7) + 1) as Weekday),
  );
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [selected]);

  const hasLessons = (w: Weekday) => lessons.some((l) => l.weekday === w);

  const tabCls = (active: boolean) =>
    `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
      active
        ? "bg-accent text-white shadow-md shadow-accent/35"
        : "text-gray-500 hover:bg-black/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.07]"
    }`;

  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5 pt-1.5">
      <button
        ref={selected === "all" ? activeRef : undefined}
        className={tabCls(selected === "all")}
        onClick={() => onSelect("all")}
      >
        Все
      </button>
      {order.map((w) => {
        const active = selected === w;
        return (
          <button
            key={w}
            ref={active ? activeRef : undefined}
            className={tabCls(active)}
            onClick={() => onSelect(w)}
          >
            {w === today ? (
              <>
                Сегодня <span className="opacity-70">•</span> {weekdayShort(w)}
              </>
            ) : (
              weekdayShort(w)
            )}
            {(() => {
              const n = pendingByDay?.[w] ?? 0;
              if (n > 0)
                return (
                  <span
                    key={n}
                    className={`anim-bounce-in min-w-[17px] rounded-full px-[5px] py-[1px] text-center text-[10.5px] font-bold leading-[14px] tabular-nums ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-pending/15 text-pending"
                    }`}
                    aria-label={`Не выполнено: ${n}`}
                  >
                    {n}
                  </span>
                );
              if (!active && hasLessons(w))
                return (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" aria-hidden="true" />
                );
              return null;
            })()}
          </button>
        );
      })}
    </div>
  );
}
