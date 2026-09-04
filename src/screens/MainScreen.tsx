import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Homework, Lesson, Weekday } from "../types";
import { lessonsForDay, useStore } from "../storage/store";
import { useNav } from "../nav";
import {
  formatDateMed,
  jsDayToWeekday,
  parseISO,
  plural,
  timeRange,
  todayISO,
  todayWeekday,
  weekdayFull,
  weekdayShort,
} from "../utils/date";
import { DayTabs } from "../components/DayTabs";
import { Highlight, LessonRow } from "../components/ChatList";
import { Avatar } from "../components/Avatar";
import { EmptyState, useToast } from "../components/ui";
import {
  IconBack,
  IconBook,
  IconCalendar,
  IconCheck,
  IconChecks,
  IconClose,
  IconGear,
  IconInbox,
  IconPlus,
  IconSearch,
} from "../components/icons";

/** Главный экран: шапка, «папки» дней, список уроков-чатов, поиск. */
export function MainScreen() {
  const { lessons, homework, loadError } = useStore();
  const nav = useNav();
  const { toast } = useToast();

  const [day, setDay] = useState<Weekday | "all">(todayWeekday());
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (loadError) toast("Сохранённые данные повреждены — загружено демо");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim().toLowerCase();

  /**
   * Бейджи вкладок — строго по ДАТЕ задания: сколько невыполненных заданий
   * поставлено на даты, выпадающие на день недели вкладки (и только на
   * сегодня или будущее). Просроченные (дата в прошлом) счётчик не раздувают.
   * Наличие уроков в этот день не важно — важна дата задания.
   */
  const pendingByDay = useMemo(() => {
    const today = todayISO();
    const res: Record<number, number> = {};
    for (const h of homework) {
      if (h.completed || h.date < today) continue;
      const wd = jsDayToWeekday(parseISO(h.date));
      res[wd] = (res[wd] ?? 0) + 1;
    }
    return res;
  }, [homework]);

  const lessonMatches = useMemo(
    () =>
      q
        ? lessons
            .filter((l) => l.title.toLowerCase().includes(q))
            .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start))
        : [],
    [lessons, q],
  );

  const hwMatches = useMemo(() => {
    if (!q) return [];
    return homework
      .filter((h) => h.text.toLowerCase().includes(q))
      .map((h) => ({ h, lesson: lessons.find((l) => l.id === h.lessonId) }))
      .filter((x): x is { h: Homework; lesson: Lesson } => Boolean(x.lesson))
      .sort((a, b) => b.h.date.localeCompare(a.h.date))
      .slice(0, 60);
  }, [homework, lessons, q]);

  const openChat = (lessonId: string, focusId?: string) =>
    nav.push({ type: "chat", lessonId, focusId: focusId ?? null });

  const iconBtn =
    "rounded-full p-2 text-gray-500 transition hover:bg-black/[0.05] hover:text-ink active:scale-90 dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-white";

  /* ---------- Результаты поиска ---------- */
  const renderSearch = () => {
    if (!q)
      return (
        <div className="px-8 py-12 text-center text-[14px] text-gray-400">
          Введите название предмета или текст задания.
          <br />
          Например: <b className="text-accent">матем</b> или <b className="text-accent">№124</b>
        </div>
      );
    if (!lessonMatches.length && !hwMatches.length)
      return (
        <EmptyState
          icon={<IconSearch size={34} />}
          title="Ничего не найдено"
          text={`По запросу «${query.trim()}» нет ни предметов, ни заданий.`}
        />
      );
    return (
      <div className="anim-fade pb-6">
        {lessonMatches.length > 0 && (
          <>
            <Caption>Предметы</Caption>
            {lessonMatches.map((l) => (
              <LessonRow
                key={l.id}
                lesson={l}
                query={query.trim()}
                dayBadge={weekdayShort(l.weekday)}
                onOpen={() => openChat(l.id)}
              />
            ))}
          </>
        )}
        {hwMatches.length > 0 && (
          <>
            <Caption>Домашние задания</Caption>
            {hwMatches.map(({ h, lesson }) => (
              <button
                key={h.id}
                onClick={() => openChat(lesson.id, h.id)}
                className="flex w-full items-center gap-3 border-b border-black/[0.055] px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-black/[0.03] active:bg-black/[0.06] dark:border-white/[0.05] dark:hover:bg-white/[0.04]"
              >
                <Avatar icon={lesson.icon} color={lesson.color} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-ink dark:text-white">
                      {lesson.title}
                    </span>
                    <span className="shrink-0 text-[11.5px] text-gray-400">
                      {formatDateMed(h.date)}
                    </span>
                  </div>
                  <p className="mt-[2px] truncate text-[13.5px] text-gray-500 dark:text-gray-400">
                    <Highlight text={h.text} query={query.trim()} />
                  </p>
                </div>
                {h.completed ? (
                  <IconChecks size={16} sw={2.4} className="shrink-0 text-accent" />
                ) : (
                  <IconCheck size={16} sw={2.4} className="shrink-0 text-pending" />
                )}
              </button>
            ))}
          </>
        )}
      </div>
    );
  };

  /* ---------- Список уроков ---------- */
  const renderList = () => {
    if (day === "all") {
      const days = [1, 2, 3, 4, 5, 6, 7] as Weekday[];
      const anyLessons = lessons.length > 0;
      if (!anyLessons) return renderNoLessons();
      return (
        <div className="pb-8">
          {days.map((w) => {
            const ls = lessonsForDay(lessons, w);
            if (!ls.length) return null;
            return (
              <div key={w}>
                <Caption>
                  {weekdayFull(w)}
                  <span className="ml-1.5 font-normal text-gray-400">
                    {ls.length} {plural(ls.length, "урок", "урока", "уроков")}
                  </span>
                </Caption>
                <div className="stagger">
                  {ls.map((l) => (
                    <LessonRow key={l.id} lesson={l} onOpen={() => openChat(l.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const ls = lessonsForDay(lessons, day);
    if (!ls.length) return renderNoLessons();

    // Счётчик под вкладками — тоже по дате задания: день недели, на который
    // выпадает дата, и только сегодня/будущее (просроченные не в счёт).
    const today = todayISO();
    let total = 0;
    let pending = 0;
    for (const h of homework) {
      if (h.date < today) continue;
      if (jsDayToWeekday(parseISO(h.date)) !== day) continue;
      total++;
      if (!h.completed) pending++;
    }
    const all = { length: total };

    return (
      <>
        <div className="flex items-center gap-2 px-4 pb-1 pt-3 text-[12px] font-medium text-gray-400 dark:text-gray-500">
          <span>
            {ls.length} {plural(ls.length, "урок", "урока", "уроков")}
          </span>
          {all.length > 0 && (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />
              <span>
                {pending > 0
                  ? `${pending} ${plural(pending, "задание", "задания", "заданий")} не выполнено`
                  : "всё выполнено"}
              </span>
            </>
          )}
        </div>
        <div key={`${day}`} className="stagger pb-8">
          {ls.map((l) => (
            <LessonRow key={l.id} lesson={l} onOpen={() => openChat(l.id)} />
          ))}
        </div>
      </>
    );
  };

  const renderNoLessons = () => (
    <EmptyState
      icon={<IconInbox size={36} />}
      title={lessons.length ? "В этот день уроков нет" : "Расписание пока пустое"}
      text={
        lessons.length
          ? "Отдыхайте! А расписание на другие дни — в соседних вкладках."
          : "Добавьте предметы и время занятий — они появятся здесь, как чаты."
      }
    >
      <button
        onClick={() => nav.push({ type: "settings" })}
        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-deep active:scale-95"
      >
        <IconPlus size={17} sw={2.5} />
        Добавить урок
      </button>
    </EmptyState>
  );

  return (
    <div className="flex h-full flex-col bg-white dark:bg-night">
      {/* Шапка */}
      <header className="z-20 border-b border-black/[0.06] bg-white/95 backdrop-blur dark:border-white/[0.06] dark:bg-panel">
        {searchOpen ? (
          <div className="flex items-center gap-1 px-2 py-[7px]">
            <button
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className={iconBtn}
              aria-label="Закрыть поиск"
            >
              <IconBack size={21} />
            </button>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Предмет или задание…"
              className="min-w-0 flex-1 bg-transparent text-[15.5px] text-ink outline-none placeholder:text-gray-400 dark:text-white"
            />
            {query && (
              <button onClick={() => setQuery("")} className={iconBtn} aria-label="Очистить">
                <IconClose size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 pb-1 pt-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-gradient-to-br from-accent to-accent-deep text-white shadow-md shadow-accent/30">
              <IconBook size={20} sw={1.9} />
            </div>
            <h1 className="font-display text-[16.5px] font-semibold tracking-tight text-ink dark:text-white">
              Дневник
            </h1>
            <div className="ml-auto flex items-center gap-0.5">
              <button onClick={() => setSearchOpen(true)} className={iconBtn} aria-label="Поиск">
                <IconSearch size={20} />
              </button>
              <button
                onClick={() => nav.push({ type: "calendar" })}
                className={iconBtn}
                aria-label="Календарь"
              >
                <IconCalendar size={20} />
              </button>
              <button
                onClick={() => nav.push({ type: "settings" })}
                className={iconBtn}
                aria-label="Настройки"
              >
                <IconGear size={20} />
              </button>
            </div>
          </div>
        )}
        {!searchOpen && (
          <DayTabs
            selected={day}
            onSelect={setDay}
            lessons={lessons}
            pendingByDay={pendingByDay}
          />
        )}
      </header>

      {/* Контент */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        {searchOpen ? renderSearch() : renderList()}
      </main>
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pb-1.5 pt-3.5 text-[12px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
      {children}
    </div>
  );
}


