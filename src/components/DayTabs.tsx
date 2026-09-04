import { useEffect, useMemo, useRef } from "react";
import type { DaySelection, Lesson, Weekday } from "../types";
import { todayWeekday, weekdayShort } from "../utils/date";

/**
 * Верхняя панель «папок»: Все | Сегодня • Пт | Сб | Вс | Пн | Вт | Ср | Чт | Пт.
 * Порядок начинается с сегодняшнего дня и идёт по кругу, а в конце стоит
 * отдельная вкладка того же дня недели — для заданий на следующие недели.
 */
export function DayTabs({
  selected,
  onSelect,
  lessons,
  pendingByDay,
  doneToday,
}: {
  selected: DaySelection;
  onSelect: (v: DaySelection) => void;
  lessons: Lesson[];
  /** Невыполненные задания будущих дат для каждого дня недели (1–7). */
  pendingByDay?: Record<number, number>;
  /** Сколько заданий с сегодняшней датой уже выполнено (зелёный бейдж). */
  doneToday?: number;
}) {
  const today = todayWeekday();

  // 7 дней по кругу от сегодняшнего + отдельная вкладка «следующая неделя».
  const tabs = useMemo(() => {
    const arr: { w: Weekday; next: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      arr.push({ w: ((((today - 1 + i) % 7) + 1) as Weekday), next: false });
    }
    arr.push({ w: today, next: true });
    return arr;
  }, [today]);

  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [selected]);

  const hasLessons = (w: Weekday) => lessons.some((l) => l.weekday === w);

  const tabCls = (active: boolean, outline: boolean) =>
    `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
      active
        ? "bg-accent text-white shadow-md shadow-accent/35"
        : `text-gray-500 hover:bg-black/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.07] ${
            outline ? "ring-1 ring-black/10 dark:ring-white/15" : ""
          }`
    }`;

  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5 pt-1.5">
      <button
        ref={selected === "all" ? activeRef : undefined}
        className={tabCls(selected === "all", false)}
        onClick={() => onSelect("all")}
      >
        Все
      </button>
      {tabs.map((tab) => {
        const sel: DaySelection = tab.next ? "next" : tab.w;
        const active = selected === sel;
        const isTodayTab = !tab.next && tab.w === today;

        // Сегодняшняя вкладка — зелёный счётчик выполненных за сегодня,
        // остальные — янтарные счётчики невыполненных будущих заданий.
        const badge = isTodayTab ? (doneToday ?? 0) : (pendingByDay?.[tab.w] ?? 0);

        return (
          <button
            key={`${tab.w}-${tab.next ? "n" : "c"}`}
            ref={active ? activeRef : undefined}
            className={tabCls(active, tab.next)}
            onClick={() => onSelect(sel)}
            title={
              tab.next
                ? `Задания на будущие ${weekdayShort(tab.w).toLowerCase()}`
                : isTodayTab
                  ? "Выполненные сегодня"
                  : undefined
            }
          >
            {isTodayTab ? (
              <>
                Сегодня <span className="opacity-70">•</span> {weekdayShort(tab.w)}
              </>
            ) : (
              weekdayShort(tab.w)
            )}
            {badge > 0 ? (
              <span
                key={badge}
                className={`anim-bounce-in min-w-[17px] rounded-full px-[5px] py-[1px] text-center text-[10.5px] font-bold leading-[14px] tabular-nums ${
                  active
                    ? "bg-white/25 text-white"
                    : isTodayTab
                      ? "bg-done/15 text-done"
                      : "bg-pending/15 text-pending"
                }`}
                aria-label={isTodayTab ? `Выполнено сегодня: ${badge}` : `Не выполнено: ${badge}`}
              >
                {badge}
              </span>
            ) : (
              !active &&
              hasLessons(tab.w) && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent/60" aria-hidden="true" />
              )
            )}
          </button>
        );
      })}
    </div>
  );
}
