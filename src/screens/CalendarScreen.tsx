import { useMemo, useState } from "react";
import { useStore } from "../storage/store";
import { useNav } from "../nav";
import {
  formatDateLong,
  relativeDayLabel,
  todayISO,
} from "../utils/date";
import { Avatar } from "../components/Avatar";
import { CalendarPicker } from "../components/CalendarPicker";
import { EmptyState } from "../components/ui";
import { IconBack, IconCalendar, IconCheck } from "../components/icons";

/**
 * Календарь: переход к любому дню года.
 * Дни с заданиями отмечены точками (жёлтая — есть невыполненные,
 * зелёная — всё сделано). Выбор дня показывает задания всех предметов.
 */
export function CalendarScreen() {
  const { lessons, homework, toggleHomework } = useStore();
  const nav = useNav();
  const [date, setDate] = useState(todayISO());

  const marks = useMemo(() => {
    const m: Record<string, "pending" | "done"> = {};
    for (const h of homework) {
      if (!h.completed) m[h.date] = "pending";
      else if (!m[h.date]) m[h.date] = "done";
    }
    return m;
  }, [homework]);

  const dayItems = useMemo(
    () =>
      homework
        .filter((h) => h.date === date)
        .map((h) => ({ h, lesson: lessons.find((l) => l.id === h.lessonId) }))
        .filter((x): x is { h: (typeof homework)[number]; lesson: (typeof lessons)[number] } =>
          Boolean(x.lesson),
        )
        .sort((a, b) => a.h.createdAt - b.h.createdAt),
    [homework, lessons, date],
  );

  const rel = relativeDayLabel(date);

  const iconBtn =
    "rounded-full p-2 text-gray-500 transition hover:bg-black/[0.05] hover:text-ink active:scale-90 dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-white";

  return (
    <div className="flex h-full flex-col bg-mist dark:bg-night">
      <header className="z-20 flex items-center gap-1 border-b border-black/[0.06] bg-white/95 px-2 py-[9px] backdrop-blur dark:border-white/[0.06] dark:bg-panel">
        <button onClick={nav.pop} className={iconBtn} aria-label="Назад">
          <IconBack size={22} />
        </button>
        <h2 className="ml-1 font-display text-[15px] font-semibold tracking-tight text-ink dark:text-white">
          Календарь
        </h2>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-4 py-3.5">
        <div key={date.slice(0, 7)} className="anim-fade">
          <CalendarPicker value={date} onChange={setDate} marks={marks} />
        </div>

        <div className="flex items-center gap-2 px-1 pb-1.5 pt-4">
          <span className="text-[13.5px] font-bold text-ink dark:text-white">
            {formatDateLong(date)}
          </span>
          {rel && (
            <span className="rounded-md bg-accent-soft px-1.5 py-[1px] text-[11px] font-bold text-accent-deep dark:bg-white/10 dark:text-accent">
              {rel}
            </span>
          )}
        </div>

        {dayItems.length === 0 ? (
          <div className="rounded-[16px] bg-white shadow-sm dark:bg-panel">
            <EmptyState
              icon={<IconCalendar size={34} />}
              title="На этот день заданий нет"
              text="Дни с заданиями отмечены точками в календаре: жёлтая — есть невыполненные, зелёная — всё сделано."
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-[16px] bg-white shadow-sm dark:bg-panel">
            {dayItems.map(({ h, lesson }) => (
              <div
                key={h.id}
                className="flex items-center gap-3 border-b border-black/[0.05] py-2.5 pl-3 pr-2.5 last:border-b-0 dark:border-white/[0.05]"
              >
                <button
                  onClick={() =>
                    nav.push({ type: "chat", lessonId: lesson.id, focusId: h.id })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] p-1 text-left transition hover:bg-black/[0.03] active:scale-[0.99] dark:hover:bg-white/[0.04]"
                >
                  <Avatar icon={lesson.icon} color={lesson.color} size={38} />
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[13px] font-bold ${
                        h.completed ? "text-gray-400 dark:text-gray-500" : "text-ink dark:text-white"
                      }`}
                    >
                      {lesson.title}
                    </span>
                    <span
                      className={`block truncate text-[13.5px] ${
                        h.completed
                          ? "text-gray-400 line-through decoration-gray-300 dark:text-gray-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {h.text}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => toggleHomework(h.id)}
                  aria-label={h.completed ? "Вернуть в работу" : "Отметить выполненным"}
                  title={h.completed ? "Вернуть в работу" : "Выполнил"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
                    h.completed
                      ? "border-done bg-done text-white"
                      : "border-gray-300 text-transparent hover:border-accent hover:text-accent/60 dark:border-gray-600"
                  }`}
                >
                  <IconCheck size={15} sw={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
