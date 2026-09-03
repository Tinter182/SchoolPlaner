import { useEffect, useState } from "react";
import {
  MONTHS_NOM,
  WEEKDAYS_SHORT,
  jsDayToWeekday,
  monthMatrix,
  parseISO,
  toISO,
  todayISO,
  addDaysISO,
} from "../utils/date";
import { IconChevronL, IconChevronR } from "./icons";

/**
 * Мобильный календарь: листается по месяцам без ограничений,
 * можно выбрать любой день учебного года (и не только).
 */
export function CalendarPicker({
  value,
  onChange,
  quick = true,
  marks,
}: {
  value: string;
  onChange: (iso: string) => void;
  /** показать чипы «Сегодня» / «Завтра» */
  quick?: boolean;
  /** точки под днями: есть задания (жёлтая — есть невыполненные) */
  marks?: Record<string, "pending" | "done">;
}) {
  const selected = parseISO(value);
  const [view, setView] = useState({ y: selected.getFullYear(), m: selected.getMonth() });
  const today = todayISO();

  // Если дату поменяли извне (чипы «Сегодня/Завтра») — показываем её месяц.
  useEffect(() => {
    setView({ y: selected.getFullYear(), m: selected.getMonth() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const shift = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const weeks = monthMatrix(view.y, view.m);
  const isThisMonth =
    view.y === new Date().getFullYear() && view.m === new Date().getMonth();

  const cellBase =
    "flex h-9 w-9 items-center justify-center rounded-full text-[13.5px] font-medium transition-all duration-150 active:scale-90";

  return (
    <div className="select-none rounded-[16px] border border-black/5 bg-white p-3 dark:border-white/8 dark:bg-bubble-dark">
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => shift(-1)}
          className="rounded-full p-2 text-gray-500 transition hover:bg-black/5 active:scale-90 dark:text-gray-300 dark:hover:bg-white/10"
          aria-label="Предыдущий месяц"
        >
          <IconChevronL size={18} />
        </button>
        <div className="text-[14px] font-bold text-ink dark:text-white">
          {MONTHS_NOM[view.m]}{" "}
          <span className="font-semibold text-gray-400 dark:text-gray-500">{view.y}</span>
        </div>
        <button
          onClick={() => shift(1)}
          className="rounded-full p-2 text-gray-500 transition hover:bg-black/5 active:scale-90 dark:text-gray-300 dark:hover:bg-white/10"
          aria-label="Следующий месяц"
        >
          <IconChevronR size={18} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className={`flex h-8 items-center justify-center text-[11.5px] font-bold uppercase ${
              i >= 5 ? "text-danger/70" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div key={`${view.y}-${view.m}`} className="anim-fade grid grid-cols-7">
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const iso = toISO(d);
          const isSel = iso === value;
          const isToday = iso === today;
          const weekend = jsDayToWeekday(d) >= 6;
          return (
            <div key={iso} className="flex justify-center py-[1px]">
              <button
                onClick={() => onChange(iso)}
                className={`relative ${cellBase} ${
                  isSel
                    ? "bg-accent font-bold text-white shadow-md shadow-accent/40"
                    : isToday
                      ? "font-bold text-accent ring-1 ring-accent/50 hover:bg-accent/10"
                      : weekend
                        ? "text-danger/75 hover:bg-black/5 dark:hover:bg-white/10"
                        : "text-ink hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {d.getDate()}
                {marks?.[iso] && (
                  <span
                    className={`absolute bottom-[2px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      isSel
                        ? "bg-white"
                        : marks[iso] === "pending"
                          ? "bg-[#f0a62b]"
                          : "bg-done"
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {quick && (
        <div className="mt-2 flex items-center gap-2 border-t border-black/5 pt-3 dark:border-white/8">
          <button
            onClick={() => onChange(today)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition active:scale-95 ${
              value === today
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent-deep hover:bg-accent/20 dark:bg-white/10 dark:text-accent"
            }`}
          >
            Сегодня
          </button>
          <button
            onClick={() => onChange(addDaysISO(today, 1))}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition active:scale-95 ${
              value === addDaysISO(today, 1)
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent-deep hover:bg-accent/20 dark:bg-white/10 dark:text-accent"
            }`}
          >
            Завтра
          </button>
          {!isThisMonth && (
            <button
              onClick={() => {
                const n = new Date();
                setView({ y: n.getFullYear(), m: n.getMonth() });
              }}
              className="ml-auto text-[12.5px] font-semibold text-gray-400 underline decoration-dotted underline-offset-4 transition hover:text-accent"
            >
              к текущему месяцу
            </button>
          )}
        </div>
      )}
    </div>
  );
}
