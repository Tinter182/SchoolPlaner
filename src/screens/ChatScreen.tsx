import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import confetti from "canvas-confetti";
import type { Homework } from "../types";
import { homeworkOfLesson, pendingCount, useStore } from "../storage/store";
import { useNav } from "../nav";
import {
  formatDateLong,
  formatClock,
  plural,
  timeRange,
  weekdayShort,
} from "../utils/date";
import { Avatar } from "../components/Avatar";
import { AddHomeworkSheet } from "../components/AddHomeworkSheet";
import { LessonEditorSheet } from "../components/LessonEditorSheet";
import { ConfirmDialog, EmptyState, useToast } from "../components/ui";
import {
  IconBack,
  IconCheck,
  IconChecks,
  IconDots,
  IconInbox,
  IconPencil,
  IconPlus,
  IconTrash,
} from "../components/icons";

/** Экран урока: «чат» с заданиями, сгруппированными по календарным датам. */
export function ChatScreen({
  lessonId,
  focusId,
}: {
  lessonId: string;
  focusId?: string | null;
}) {
  const { lessons, homework, toggleHomework, deleteLesson } = useStore();
  const nav = useNav();
  const { toast } = useToast();

  const lesson = lessons.find((l) => l.id === lessonId);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(focusId ?? null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const hws = useMemo(
    () => (lesson ? homeworkOfLesson(homework, lesson.id) : []),
    [homework, lesson],
  );
  const pending = pendingCount(hws);

  // Группировка по датам (даты уже отсортированы по возрастанию).
  const groups = useMemo(() => {
    const res: { date: string; items: Homework[] }[] = [];
    for (const h of hws) {
      const last = res[res.length - 1];
      if (last && last.date === h.date) last.items.push(h);
      else res.push({ date: h.date, items: [h] });
    }
    return res;
  }, [hws]);

  // Урок удалён (или не найден) — мгновенно возвращаемся к списку.
  useEffect(() => {
    if (!lesson) nav.resetToMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  // При открытии: к нужному сообщению (из поиска) или вниз ленты.
  useEffect(() => {
    if (focusId) {
      requestAnimationFrame(() => {
        msgRefs.current[focusId]?.scrollIntoView({ block: "center" });
      });
      const t = setTimeout(() => setFlashId(null), 2600);
      return () => clearTimeout(t);
    }
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, focusId]);

  const handleAdded = (id: string) => {
    setFlashId(id);
    // дожидаемся рендера нового пузыря и плавно едем к нему
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        msgRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" });
        window.setTimeout(() => setFlashId(null), 2400);
      }),
    );
  };

  const handleToggle = (h: Homework, e: MouseEvent) => {
    const updated = toggleHomework(h.id);
    if (updated?.completed) {
      confetti({
        particleCount: 28,
        spread: 60,
        startVelocity: 24,
        gravity: 1.15,
        ticks: 110,
        scalar: 0.85,
        origin: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        colors: ["#0e8fa3", "#43cf7c", "#ffc24b", "#f2506e", "#54c8ff"],
      });
    }
  };

  const confirmDelete = () => {
    if (!lesson) return;
    deleteLesson(lesson.id);
    setDelOpen(false);
    toast("Урок удалён");
    nav.resetToMain();
  };

  if (!lesson) return null;

  const iconBtn =
    "rounded-full p-2 text-gray-500 transition hover:bg-black/[0.05] hover:text-ink active:scale-90 dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-white";

  return (
    <div className="flex h-full flex-col bg-white dark:bg-night">
      {/* Шапка: ← ⊕ Название ⋮ */}
      <header className="z-20 flex items-center gap-1.5 border-b border-black/[0.06] bg-white/95 px-2 py-[7px] backdrop-blur dark:border-white/[0.06] dark:bg-panel">
        <button onClick={nav.pop} className={iconBtn} aria-label="Назад к списку">
          <IconBack size={22} />
        </button>

        {/* Кнопка ⊕ на месте аватарки — добавляет задание */}
        <button
          onClick={() => setAddOpen(true)}
          aria-label="Добавить задание"
          title="Добавить задание"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-deep text-white shadow-md shadow-accent/35 transition hover:brightness-110 active:scale-90"
        >
          <IconPlus size={22} sw={2.5} />
        </button>

        <div className="ml-1 min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-bold leading-tight text-ink dark:text-white">
            {lesson.title}
          </h2>
          <p className="truncate text-[12px] leading-tight text-gray-400 dark:text-gray-500">
            {weekdayShort(lesson.weekday)} · {timeRange(lesson.start, lesson.end)}
            {pending > 0 && (
              <span className="text-pending">
                {" "}
                · {pending} {plural(pending, "задание", "задания", "заданий")} ждёт
              </span>
            )}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={iconBtn}
            aria-label="Меню урока"
          >
            <IconDots size={20} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="anim-pop absolute right-0 top-11 z-40 w-56 rounded-[14px] bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:bg-panel dark:ring-white/10">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] font-medium text-ink transition hover:bg-black/[0.045] dark:text-gray-200 dark:hover:bg-white/[0.06]"
                >
                  <IconPencil size={17} className="text-gray-400" />
                  Редактировать урок
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setDelOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14px] font-medium text-danger transition hover:bg-danger/[0.07]"
                >
                  <IconTrash size={17} />
                  Удалить урок
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Лента заданий */}
      <div ref={scrollRef} className="chat-pattern no-scrollbar flex-1 overflow-y-auto px-3 py-2.5">
        {hws.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={<IconInbox size={36} />}
              title="Заданий пока нет"
              text="Нажмите ⊕ в шапке, чтобы записать домашнее задание на любую дату."
            >
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-deep active:scale-95"
              >
                <IconPlus size={17} sw={2.5} />
                Добавить задание
              </button>
            </EmptyState>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.date}>
              {/* Разделитель даты — как в Telegram */}
              <div className="sticky top-0 z-10 my-2 flex justify-center">
                <span className="rounded-full bg-[#0b1c26]/30 px-3.5 py-[5px] text-[12.5px] font-semibold text-white shadow-sm backdrop-blur-[3px] dark:bg-black/45">
                  {formatDateLong(g.date)}
                </span>
              </div>
              <div className="space-y-2">
                {g.items.map((h) => (
                  <div
                    key={h.id}
                    ref={(el) => {
                      msgRefs.current[h.id] = el;
                    }}
                    className={`max-w-[86%] rounded-[16px] rounded-bl-[6px] bg-white px-3.5 pb-2.5 pt-3 shadow-[0_1px_2.5px_rgba(16,36,46,0.14)] dark:bg-bubble-dark dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] ${
                      flashId === h.id ? "msg-flash" : "anim-fade"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[14.5px] leading-snug text-ink dark:text-gray-100">
                      <span className="font-bold">Задание — </span>
                      {h.text}
                    </p>
                    <div className="mt-1 text-right text-[10.5px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
                      {formatClock(new Date(h.createdAt))}
                    </div>
                    {h.completed ? (
                      <div className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-done/10 py-[7px] text-[13.5px] font-bold text-done">
                        <IconChecks size={16} sw={2.5} />
                        Сделано
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleToggle(h, e)}
                        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-accent-soft py-[7px] text-[13.5px] font-bold text-accent-deep transition hover:bg-accent/20 active:scale-[0.97] dark:bg-white/[0.08] dark:text-accent"
                      >
                        <IconCheck size={16} sw={2.6} />
                        Выполнил
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
        <div className="h-3" />
      </div>

      {/* Шторки и диалоги */}
      <AddHomeworkSheet lesson={lesson} open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAdded} />
      <LessonEditorSheet lesson={lesson} open={editOpen} onClose={() => setEditOpen(false)} />
      <ConfirmDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        title="Удалить урок?"
        onConfirm={confirmDelete}
      >
        <div className="mb-3 flex items-center gap-3 rounded-[12px] bg-mist p-2.5 dark:bg-bubble-dark">
          <Avatar icon={lesson.icon} color={lesson.color} size={38} />
          <div>
            <div className="text-[14px] font-bold text-ink dark:text-white">{lesson.title}</div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400">
              {weekdayShort(lesson.weekday)} · {timeRange(lesson.start, lesson.end)}
            </div>
          </div>
        </div>
        {hws.length > 0 ? (
          <>
            Домашние задания этого урока ({hws.length}{" "}
            {plural(hws.length, "задание", "задания", "заданий")}) также будут удалены.
            <br />
            Это действие нельзя отменить.
          </>
        ) : (
          "Это действие нельзя отменить."
        )}
      </ConfirmDialog>
    </div>
  );
}
