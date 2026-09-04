import type { Lesson } from "../types";
import { homeworkOfGroup, lastHomework, useStore } from "../storage/store";
import { jsDayToWeekday, parseISO, timeRange, weekdayShort } from "../utils/date";
import { Avatar } from "./Avatar";
import { IconCheck, IconChecks } from "./icons";

/** Подсветка совпадения при поиске. */
export function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-accent/25 px-[1px] text-inherit">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

/** Строка списка: урок как «чат». Справа — время урока и статус последнего задания. */
export function LessonRow({
  lesson,
  onOpen,
  dayBadge,
  query,
}: {
  lesson: Lesson;
  onOpen: () => void;
  dayBadge?: string;
  query?: string;
}) {
  const { homework, lessons } = useStore();
  const groupHws = homeworkOfGroup(homework, lessons, lesson);
  // Превью на вкладке показывает только задания, календарная дата которых
  // выпадает на день недели этого урока. Внутри чата видны все задания группы.
  const hws = groupHws.filter(
    (h) => jsDayToWeekday(parseISO(h.date)) === lesson.weekday,
  );
  const last = lastHomework(hws);

  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 border-b border-black/[0.055] px-3.5 py-[9px] text-left transition-colors last:border-b-0 hover:bg-black/[0.03] active:bg-black/[0.06] dark:border-white/[0.05] dark:hover:bg-white/[0.04] dark:active:bg-white/[0.07]"
    >
      <Avatar icon={lesson.icon} color={lesson.color} size={50} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {dayBadge && (
            <span className="shrink-0 rounded-md bg-accent-soft px-1.5 py-[1.5px] text-[10.5px] font-bold uppercase tracking-wide text-accent-deep dark:bg-white/10 dark:text-accent">
              {dayBadge}
            </span>
          )}
          <h3 className="truncate text-[15.5px] font-semibold text-ink dark:text-white">
            <Highlight text={lesson.title} query={query} />
          </h3>
        </div>
        <p className="mt-[3px] truncate text-[13.5px] text-gray-500 dark:text-gray-400">
          {last ? (
            <>
              <span className="text-gray-400 dark:text-gray-500">Задание — </span>
              <Highlight text={last.text} query={query} />
            </>
          ) : groupHws.length > 0 ? (
            <span className="italic text-gray-400 dark:text-gray-500">
              Нет заданий на {weekdayShort(lesson.weekday).toLowerCase()}
            </span>
          ) : (
            <span className="italic text-gray-400 dark:text-gray-500">Заданий пока нет</span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-[5px] pt-[2px]">
        <span className="text-[12px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
          {timeRange(lesson.start, lesson.end)}
        </span>
        {last &&
          (last.completed ? (
            <span className="checks-draw text-accent" title="Последнее задание выполнено">
              <IconChecks size={16} sw={2.4} />
            </span>
          ) : (
            <span className="text-pending" title="Есть невыполненное задание">
              <IconCheck size={16} sw={2.4} />
            </span>
          ))}
      </div>
    </button>
  );
}
