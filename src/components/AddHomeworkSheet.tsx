import { useEffect, useState } from "react";
import type { Lesson } from "../types";
import { useStore } from "../storage/store";
import {
  formatDateLong,
  nextGroupLessonDate,
  relativeDayLabel,
  timeRange,
  weekdayFull,
  weekdayShort,
} from "../utils/date";
import { Sheet, useToast } from "./ui";
import { CalendarPicker } from "./CalendarPicker";
import { Avatar } from "./Avatar";
import { IconCalendar, IconChevronDown, IconPlus } from "./icons";

/**
 * Шторка создания задания. Дата выбирается настоящим календарём —
 * можно назначить задание на любой день, не только на сегодня.
 */
export function AddHomeworkSheet({
  lesson,
  open,
  onClose,
  onAdded,
}: {
  lesson: Lesson;
  open: boolean;
  onClose: () => void;
  /** вызывается с id нового задания (для прокрутки чата к нему) */
  onAdded?: (id: string) => void;
}) {
  const { addHomework, lessons } = useStore();
  const { toast } = useToast();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");
  const [calOpen, setCalOpen] = useState(true);

  // Сброс формы при каждом открытии.
  useEffect(() => {
    if (open) {
      const now = new Date();
      setDate(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
          now.getDate(),
        ).padStart(2, "0")}`,
      );
      setText("");
      setCalOpen(true);
    }
  }, [open, lesson.id]);

  const canSubmit = text.trim().length > 0;
  const rel = relativeDayLabel(date);

  // «Следующий урок»: ближайшее занятие ГРУППЫ предмета (уроки с той же
  // иконкой в любые дни) строго с завтрашнего дня; сегодняшние пропускаются.
  const next = nextGroupLessonDate(lessons, lesson.icon);
  const groupSize = lessons.filter((l) => l.icon === lesson.icon).length;

  const submit = () => {
    if (!canSubmit) return;
    const hw = addHomework(lesson.id, date, text);
    toast(`Задание добавлено · ${formatDateLong(date)}`);
    onAdded?.(hw.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Новое задание">
      {/* Для какого урока */}
      <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-mist p-3 dark:bg-bubble-dark">
        <Avatar icon={lesson.icon} color={lesson.color} size={38} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-ink dark:text-white">
            {lesson.title}
          </div>
          <div className="text-[12px] text-gray-500 dark:text-gray-400">
            {weekdayFull(lesson.weekday)} · {timeRange(lesson.start, lesson.end)}
          </div>
          {groupSize > 1 && (
            <div className="mt-[2px] text-[11.5px] font-medium text-accent-deep dark:text-accent">
              {lesson.icon} Группа из {groupSize} уроков — задание будет видно во всех чатах
              предмета
            </div>
          )}
        </div>
      </div>

      {/* Дата */}
      <button
        onClick={() => setCalOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-[14px] border border-black/[0.08] p-3 text-left transition hover:border-accent/40 dark:border-white/10"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent-soft text-accent dark:bg-white/10">
          <IconCalendar size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Дата
          </span>
          <span
            key={date}
            className="anim-pop block truncate text-[14.5px] font-semibold text-ink dark:text-white"
          >
            {formatDateLong(date)}
            {rel && (
              <span className="ml-2 rounded-md bg-accent-soft px-1.5 py-[1px] text-[11px] font-bold text-accent-deep dark:bg-white/10 dark:text-accent">
                {rel}
              </span>
            )}
          </span>
        </span>
        <IconChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${calOpen ? "rotate-180" : ""}`}
        />
      </button>

      {calOpen && (
        <div className="anim-pop mt-2.5">
          <CalendarPicker
            value={date}
            onChange={setDate}
            extraChips={[
              {
                label: `След. урок · ${weekdayShort(next.weekday)} ${next.start}`,
                iso: next.iso,
              },
            ]}
          />
        </div>
      )}

      {/* Текст задания */}
      <label className="mt-4 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        Задание
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={3}
        placeholder="Например: решить упражнения №124–127"
        className="mt-1.5 w-full resize-none rounded-[14px] border border-black/[0.08] bg-mist p-3.5 text-[15px] leading-snug text-ink outline-none transition placeholder:text-gray-400 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20 dark:border-white/10 dark:bg-bubble-dark dark:text-white dark:focus:bg-bubble-dark"
      />

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent py-3 text-[15px] font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-deep active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
      >
        <IconPlus size={18} sw={2.6} />
        Добавить
      </button>
    </Sheet>
  );
}
