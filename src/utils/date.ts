import type { Weekday } from "../types";

/** Русские названия и форматирование дат — всё в локальной таймзоне. */

export const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const WEEKDAYS_FULL = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

/** Родительный падеж: «3 сентября». */
export const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** Именительный падеж для шапки календаря. */
export const MONTHS_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** «3 сентября 2026» */
export function formatDateLong(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;
}

/** «3 сентября» */
export function formatDateMed(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

/** JS getDay() (0=Вс) → наш формат (1=Пн…7=Вс). */
export function jsDayToWeekday(d: Date): Weekday {
  return (((d.getDay() + 6) % 7) + 1) as Weekday;
}

export function todayWeekday(): Weekday {
  return jsDayToWeekday(new Date());
}

export function weekdayShort(w: Weekday): string {
  return WEEKDAYS_SHORT[w - 1];
}

export function weekdayFull(w: Weekday): string {
  return WEEKDAYS_FULL[w - 1];
}

/** «08:30–09:15» */
export function timeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

/** HH:MM для статус-бара. */
export function formatClock(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Русские формы множественного числа: plural(3, "урок", "урока", "уроков"). */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
}

/** Сетка месяца (недели по 7 ячеек, понедельник первый). null — пустая ячейка. */
export function monthMatrix(year: number, month0: number): (Date | null)[][] {
  const first = new Date(year, month0, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysIn = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Ближайшая дата (включая сегодня) с нужным днём недели. */
export function nextOccurrenceISO(weekday: Weekday): string {
  const d = new Date();
  const diff = (weekday - jsDayToWeekday(d) + 7) % 7;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

/** Информация о ближайшем занятии группы предметов. */
export interface NextLessonInfo {
  iso: string;
  weekday: Weekday;
  start: string;
  title: string;
}

/**
 * Ближайшее занятие предмета (группа = уроки с одинаковой иконкой)
 * по ВСЕМ дням недели, строго начиная с завтрашнего дня.
 * Сегодняшние занятия группы пропускаются: если предмет есть сегодня,
 * берётся его следующее занятие на следующей неделе.
 */
export function nextGroupLessonDate(
  lessons: { weekday: Weekday; start: string; title: string; icon: string }[],
  icon: string,
): NextLessonInfo {
  const tw = todayWeekday();
  let best: { offset: number; lesson: (typeof lessons)[number] } | null = null;
  for (const l of lessons) {
    if (l.icon !== icon) continue;
    let offset = (l.weekday - tw + 7) % 7;
    if (offset === 0) offset = 7; // сегодняшнее занятие группы пропускаем
    if (
      !best ||
      offset < best.offset ||
      (offset === best.offset && l.start < best.lesson.start)
    ) {
      best = { offset, lesson: l };
    }
  }
  // Группа всегда содержит хотя бы урок, из которого её открыли.
  const b = best as { offset: number; lesson: (typeof lessons)[number] };
  return {
    iso: addDaysISO(todayISO(), b.offset),
    weekday: b.lesson.weekday,
    start: b.lesson.start,
    title: b.lesson.title,
  };
}

export function relativeDayLabel(iso: string): string | null {
  const t = todayISO();
  if (iso === t) return "Сегодня";
  if (iso === addDaysISO(t, 1)) return "Завтра";
  if (iso === addDaysISO(t, -1)) return "Вчера";
  return null;
}
