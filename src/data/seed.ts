import type { AppData, Homework, Lesson } from "../types";
import { addDaysISO, todayISO } from "../utils/date";

/** Градиентные пары для аватарок предметов. */
export const PALETTES: [string, string][] = [
  ["#ff9a62", "#f2506e"], // коралл
  ["#ffc24b", "#f5822a"], // янтарь
  ["#43cf7c", "#0d9a5f"], // зелень
  ["#54c8ff", "#2a7ef2"], // небо
  ["#b28bff", "#7a4de8"], // фиалка
  ["#ff8ac2", "#e14b93"], // роза
  ["#3fd8c2", "#0c8f86"], // мята
  ["#93a7bd", "#5c6f86"], // графит
];

export const ICON_PRESETS = [
  "📐", "📖", "✒️", "⚛️", "🧪", "🌍", "🏛️", "💻", "🇬🇧",
  "🎨", "🎵", "🧮", "📏", "🔬", "🗣️", "🏃", "🌱", "⭐",
];

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Демо-данные первого запуска. Даты заданий строятся относительно «сегодня»,
 * чтобы разделители дат и статусы были видны сразу.
 */
export function seedData(): AppData {
  const today = todayISO();
  const d = (n: number) => addDaysISO(today, n);
  const now = Date.now();
  const H = 3_600_000;

  const lessons: Lesson[] = [
    { id: "l-math-mon", title: "Математика", icon: "📐", color: 3, weekday: 1, start: "08:30", end: "09:15" },
    { id: "l-rus-mon", title: "Русский язык", icon: "📖", color: 2, weekday: 1, start: "09:25", end: "10:10" },
    { id: "l-phys-mon", title: "Физика", icon: "⚛️", color: 1, weekday: 1, start: "10:20", end: "11:05" },
    { id: "l-hist-mon", title: "История", icon: "🏛️", color: 4, weekday: 1, start: "11:20", end: "12:05" },
    { id: "l-eng-tue", title: "Английский язык", icon: "🇬🇧", color: 3, weekday: 2, start: "08:30", end: "09:15" },
    { id: "l-math-tue", title: "Математика", icon: "📐", color: 3, weekday: 2, start: "09:25", end: "10:10" },
    { id: "l-chem-wed", title: "Химия", icon: "🧪", color: 6, weekday: 3, start: "08:30", end: "09:15" },
    { id: "l-geo-wed", title: "География", icon: "🌍", color: 2, weekday: 3, start: "09:25", end: "10:10" },
    { id: "l-cs-wed", title: "Информатика", icon: "💻", color: 5, weekday: 3, start: "10:20", end: "11:05" },
    { id: "l-math-thu", title: "Математика", icon: "📐", color: 3, weekday: 4, start: "08:30", end: "09:15" },
    { id: "l-lit-thu", title: "Литература", icon: "✒️", color: 0, weekday: 4, start: "09:25", end: "10:10" },
    { id: "l-phys-fri", title: "Физика", icon: "⚛️", color: 1, weekday: 5, start: "08:30", end: "09:15" },
    { id: "l-rus-fri", title: "Русский язык", icon: "📖", color: 2, weekday: 5, start: "09:25", end: "10:10" },
    { id: "l-eng-fri", title: "Английский язык", icon: "🇬🇧", color: 3, weekday: 5, start: "10:20", end: "11:05" },
  ];

  const homework: Homework[] = [
    { id: uid(), lessonId: "l-math-mon", date: d(-1), text: "Решить №120–123", completed: true, createdAt: now - 26 * H },
    { id: uid(), lessonId: "l-math-mon", date: d(0), text: "Решить №124–127", completed: false, createdAt: now - 20 * H },
    { id: uid(), lessonId: "l-math-mon", date: d(1), text: "Выучить формулы сокращённого умножения", completed: false, createdAt: now - 3 * H },
    { id: uid(), lessonId: "l-rus-mon", date: d(0), text: "Упражнение 56, выучить правило", completed: false, createdAt: now - 8 * H },
    { id: uid(), lessonId: "l-phys-mon", date: d(-2), text: "§17, законспектировать", completed: true, createdAt: now - 50 * H },
    { id: uid(), lessonId: "l-phys-mon", date: d(1), text: "§18, ответить на вопросы после параграфа", completed: false, createdAt: now - 5 * H },
    { id: uid(), lessonId: "l-hist-mon", date: d(3), text: "Подготовить доклад: реформы Петра I", completed: false, createdAt: now - 2 * H },
    { id: uid(), lessonId: "l-eng-tue", date: d(1), text: "Выучить неправильные глаголы, стр. 42", completed: false, createdAt: now - 7 * H },
    { id: uid(), lessonId: "l-math-tue", date: d(-1), text: "№118 (а, б), повторить теорию к контрольной", completed: false, createdAt: now - 30 * H },
    { id: uid(), lessonId: "l-chem-wed", date: d(2), text: "Выучить формулы оксидов", completed: false, createdAt: now - 4 * H },
    { id: uid(), lessonId: "l-lit-thu", date: d(4), text: "Прочитать «Капитанскую дочку», главы 6–7", completed: false, createdAt: now - 6 * H },
  ];

  return { lessons, homework };
}
