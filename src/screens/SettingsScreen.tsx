import { useState, type ReactNode } from "react";
import type { Lesson, Weekday } from "../types";
import { homeworkOfLesson, lessonsForDay, useStore } from "../storage/store";
import { useNav } from "../nav";
import { plural, timeRange, weekdayFull, weekdayShort } from "../utils/date";
import { Avatar } from "../components/Avatar";
import { LessonEditorSheet } from "../components/LessonEditorSheet";
import { ConfirmDialog, useToast } from "../components/ui";
import {
  IconBack,
  IconMoon,
  IconPencil,
  IconPlus,
  IconReset,
  IconSun,
  IconTrash,
} from "../components/icons";

/** Настройки: тема, полный редактор расписания, данные. */
export function SettingsScreen() {
  const { lessons, homework, theme, setTheme, deleteLesson, resetDemo } = useStore();
  const nav = useNav();
  const { toast } = useToast();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [addingDay, setAddingDay] = useState<Weekday | null>(null);
  const [deleting, setDeleting] = useState<Lesson | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const openEditor = (l: Lesson | null, day?: Weekday) => {
    setEditing(l);
    setAddingDay(day ?? null);
    setEditorOpen(true);
  };

  const deletingHw = deleting ? homeworkOfLesson(homework, deleting.id).length : 0;

  const ghostBtn =
    "rounded-full p-2 text-gray-400 transition hover:bg-black/[0.05] hover:text-ink active:scale-90 dark:hover:bg-white/[0.08] dark:hover:text-white";

  return (
    <div className="flex h-full flex-col bg-mist dark:bg-night">
      <header className="z-20 flex items-center gap-1 border-b border-black/[0.06] bg-white/95 px-2 py-[9px] backdrop-blur dark:border-white/[0.06] dark:bg-panel">
        <button onClick={nav.pop} className={ghostBtn} aria-label="Назад">
          <IconBack size={22} />
        </button>
        <h2 className="ml-1 font-display text-[15px] font-semibold tracking-tight text-ink dark:text-white">
          Настройки
        </h2>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 pt-1">
        {/* -------- Оформление -------- */}
        <SectionTitle>Оформление</SectionTitle>
        <div className="rounded-[16px] bg-white px-4 py-3.5 shadow-sm dark:bg-panel">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[14.5px] font-semibold text-ink dark:text-white">Тема</div>
              <div className="text-[12px] text-gray-400 dark:text-gray-500">
                Светлая — основная, тёмная — одним касанием
              </div>
            </div>
            <div className="flex shrink-0 rounded-full bg-mist p-1 dark:bg-bubble-dark">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-all ${
                  theme === "light"
                    ? "bg-white text-accent-deep shadow dark:bg-white/15 dark:text-white"
                    : "text-gray-400 hover:text-ink dark:hover:text-white"
                }`}
              >
                <IconSun size={14} />
                Светлая
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold transition-all ${
                  theme === "dark"
                    ? "bg-white text-accent-deep shadow dark:bg-white/15 dark:text-white"
                    : "text-gray-400 hover:text-ink dark:hover:text-white"
                }`}
              >
                <IconMoon size={14} />
                Тёмная
              </button>
            </div>
          </div>
        </div>

        {/* -------- Расписание -------- */}
        <SectionTitle>Расписание</SectionTitle>
        {([1, 2, 3, 4, 5, 6, 7] as Weekday[]).map((w) => {
          const ls = lessonsForDay(lessons, w);
          return (
            <div key={w} className="mb-3 overflow-hidden rounded-[16px] bg-white shadow-sm dark:bg-panel">
              <div className="flex items-center justify-between px-4 pb-1 pt-3">
                <span className="text-[13.5px] font-bold text-ink dark:text-white">
                  {weekdayFull(w)}
                </span>
                <span className="text-[11.5px] font-medium text-gray-400">
                  {ls.length
                    ? `${ls.length} ${plural(ls.length, "урок", "урока", "уроков")}`
                    : "нет уроков"}
                </span>
              </div>
              {ls.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-1.5 border-t border-black/[0.05] py-2 pl-3 pr-2 dark:border-white/[0.05]"
                >
                  <button
                    onClick={() => openEditor(l)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] p-1 text-left transition hover:bg-black/[0.03] active:scale-[0.99] dark:hover:bg-white/[0.04]"
                  >
                    <Avatar icon={l.icon} color={l.color} size={38} />
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] font-semibold text-ink dark:text-white">
                        {l.title}
                      </span>
                      <span className="block text-[12px] tabular-nums text-gray-400 dark:text-gray-500">
                        {timeRange(l.start, l.end)}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => openEditor(l)}
                    className={ghostBtn}
                    aria-label={`Редактировать ${l.title}`}
                  >
                    <IconPencil size={17} />
                  </button>
                  <button
                    onClick={() => setDeleting(l)}
                    className={`${ghostBtn} hover:text-danger dark:hover:text-danger`}
                    aria-label={`Удалить ${l.title}`}
                  >
                    <IconTrash size={17} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => openEditor(null, w)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-black/[0.05] py-2.5 text-[13.5px] font-bold text-accent transition hover:bg-accent/[0.06] active:bg-accent/[0.1] dark:border-white/[0.05]"
              >
                <IconPlus size={16} sw={2.6} />
                Добавить урок
              </button>
            </div>
          );
        })}

        {/* -------- Данные -------- */}
        <SectionTitle>Данные</SectionTitle>
        <div className="overflow-hidden rounded-[16px] bg-white shadow-sm dark:bg-panel">
          <button
            onClick={() => setResetOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-black/[0.03] active:bg-black/[0.05] dark:hover:bg-white/[0.04]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-mist text-gray-500 dark:bg-bubble-dark dark:text-gray-300">
              <IconReset size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink dark:text-white">
                Загрузить демо-данные
              </span>
              <span className="block text-[12px] text-gray-400">
                Вернуть тестовое расписание и задания
              </span>
            </span>
          </button>
        </div>
        <p className="px-1 pb-2 pt-3 text-[12px] leading-relaxed text-gray-400 dark:text-gray-500">
          Всё хранится локально на этом устройстве: без серверов, аккаунтов и интернета.
          Изменения расписания не трогают даты заданий — они привязаны к уроку.
        </p>

        <div className="py-4 text-center text-[11.5px] font-medium text-gray-400/80 dark:text-gray-600">
          Дневник · v1.0 · работает офлайн
        </div>
      </main>

      {/* -------- Шторки и диалоги -------- */}
      <LessonEditorSheet
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        lesson={editing}
        defaultWeekday={addingDay ?? undefined}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Удалить урок?"
        onConfirm={() => {
          if (!deleting) return;
          deleteLesson(deleting.id);
          toast(`«${deleting.title}» удалён`);
          setDeleting(null);
        }}
      >
        {deleting && (
          <div className="mb-3 flex items-center gap-3 rounded-[12px] bg-mist p-2.5 dark:bg-bubble-dark">
            <Avatar icon={deleting.icon} color={deleting.color} size={38} />
            <div>
              <div className="text-[14px] font-bold text-ink dark:text-white">
                {deleting.title}
              </div>
              <div className="text-[12px] text-gray-500 dark:text-gray-400">
                {weekdayShort(deleting.weekday)} · {timeRange(deleting.start, deleting.end)}
              </div>
            </div>
          </div>
        )}
        {deletingHw > 0 ? (
          <>
            Домашние задания этого урока ({deletingHw}{" "}
            {plural(deletingHw, "задание", "задания", "заданий")}) также будут удалены.
            <br />
            Это действие нельзя отменить.
          </>
        ) : (
          "Это действие нельзя отменить."
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Заменить данные демо-версией?"
        confirmLabel="Заменить"
        onConfirm={() => {
          resetDemo();
          setResetOpen(false);
          toast("Демо-данные загружены");
        }}
      >
        Текущее расписание ({lessons.length}{" "}
        {plural(lessons.length, "урок", "урока", "уроков")}) и{" "}
        {homework.length} {plural(homework.length, "задание", "задания", "заданий")} будут
        заменены тестовыми.
      </ConfirmDialog>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="px-1 pb-1.5 pt-4 text-[12px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
      {children}
    </div>
  );
}
