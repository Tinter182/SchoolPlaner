import { useEffect, useState } from "react";
import type { Lesson, Weekday } from "../types";
import { ICON_PRESETS, PALETTES } from "../data/seed";
import { useStore } from "../storage/store";
import { WEEKDAYS_FULL, todayWeekday, weekdayShort } from "../utils/date";
import { Sheet, useToast } from "./ui";
import { TimePicker } from "./TimePicker";

/**
 * Экран создания/редактирования урока.
 * При редактировании данные подставляются, сохранение обновляет список,
 * вкладку дня и шапку чата — везде сразу.
 */
export function LessonEditorSheet({
  open,
  onClose,
  lesson,
  defaultWeekday,
}: {
  open: boolean;
  onClose: () => void;
  /** null → создание нового урока */
  lesson: Lesson | null;
  defaultWeekday?: Weekday;
}) {
  const { addLesson, updateLesson } = useStore();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(ICON_PRESETS[0]);
  const [color, setColor] = useState(0);
  const [weekday, setWeekday] = useState<Weekday>(todayWeekday());
  const [start, setStart] = useState("08:30");
  const [end, setEnd] = useState("09:15");

  useEffect(() => {
    if (!open) return;
    if (lesson) {
      setTitle(lesson.title);
      setIcon(lesson.icon);
      setColor(lesson.color);
      setWeekday(lesson.weekday);
      setStart(lesson.start);
      setEnd(lesson.end);
    } else {
      setTitle("");
      setIcon(ICON_PRESETS[Math.floor(Math.random() * ICON_PRESETS.length)]);
      setColor(Math.floor(Math.random() * PALETTES.length));
      setWeekday(defaultWeekday ?? todayWeekday());
      setStart("08:30");
      setEnd("09:15");
    }
  }, [open, lesson, defaultWeekday]);

  const submit = () => {
    const t = title.trim();
    if (!t) {
      toast("Введите название предмета");
      return;
    }
    if (end <= start) {
      toast("Конец урока должен быть позже начала");
      return;
    }
    if (lesson) {
      updateLesson(lesson.id, { title: t, icon, color, weekday, start, end });
      toast("Урок обновлён");
    } else {
      addLesson({ title: t, icon, color, weekday, start, end });
      toast(`«${t}» добавлен · ${WEEKDAYS_FULL[weekday - 1]}`);
    }
    onClose();
  };

  const label = "block text-[11px] font-semibold uppercase tracking-wide text-gray-400";

  return (
    <Sheet open={open} onClose={onClose} title={lesson ? "Редактировать урок" : "Новый урок"}>
      <label className={label}>Название</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Математика"
        maxLength={40}
        className="mt-1.5 w-full rounded-[14px] border border-black/[0.08] bg-mist px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-gray-400 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20 dark:border-white/10 dark:bg-bubble-dark dark:text-white dark:focus:bg-bubble-dark"
      />

      <label className={`${label} mt-4`}>Иконка</label>
      <div className="no-scrollbar -mx-1 mt-1.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {ICON_PRESETS.map((e) => (
          <button
            key={e}
            onClick={() => setIcon(e)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[20px] transition-all active:scale-90 ${
              icon === e
                ? "bg-accent-soft ring-2 ring-accent dark:bg-white/10"
                : "bg-mist hover:bg-black/[0.06] dark:bg-bubble-dark dark:hover:bg-white/10"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <label className={`${label} mt-3`}>Цвет аватарки</label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {PALETTES.map(([a, b], i) => (
          <button
            key={i}
            onClick={() => setColor(i)}
            aria-label={`Палитра ${i + 1}`}
            className={`h-8 w-8 rounded-full transition-all active:scale-90 ${
              color === i ? "ring-2 ring-accent ring-offset-2 ring-offset-white dark:ring-offset-panel" : "hover:scale-110"
            }`}
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
          />
        ))}
      </div>

      <label className={`${label} mt-4`}>День недели</label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {WEEKDAYS_FULL.map((full, i) => {
          const w = (i + 1) as Weekday;
          return (
            <button
              key={w}
              onClick={() => setWeekday(w)}
              title={full}
              className={`rounded-full px-3.5 py-[7px] text-[13px] font-semibold transition-all active:scale-95 ${
                weekday === w
                  ? "bg-accent text-white shadow-md shadow-accent/30"
                  : "bg-mist text-gray-500 hover:bg-black/[0.06] dark:bg-bubble-dark dark:text-gray-400 dark:hover:bg-white/10"
              }`}
            >
              {weekdayShort(w)}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-black/[0.07] p-2 dark:border-white/10">
          <div className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Начало
          </div>
          <TimePicker value={start} onChange={setStart} />
        </div>
        <div className="rounded-[16px] border border-black/[0.07] p-2 dark:border-white/10">
          <div className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Конец
          </div>
          <TimePicker value={end} onChange={setEnd} />
        </div>
      </div>

      <button
        onClick={submit}
        className="mt-5 w-full rounded-[14px] bg-accent py-3 text-[15px] font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-deep active:scale-[0.98]"
      >
        {lesson ? "Сохранить" : "Добавить урок"}
      </button>

      {lesson && (
        <p className="mt-3 text-center text-[12px] leading-relaxed text-gray-400">
          Задания урока привязаны к нему и не пропадут
          <br />
          при смене дня или времени.
        </p>
      )}
    </Sheet>
  );
}
