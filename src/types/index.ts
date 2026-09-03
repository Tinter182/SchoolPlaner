/** Доменные типы приложения «Дневник». */

/** День недели: 1 = Понедельник … 7 = Воскресенье (удобно для сортировки). */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Урок в расписании (аналог «чата»). */
export interface Lesson {
  id: string;
  title: string;
  /** Эмодзи-иконка предмета. */
  icon: string;
  /** Индекс градиентной палитры аватарки (PALETTES). */
  color: number;
  weekday: Weekday;
  /** "08:30" */
  start: string;
  /** "09:15" */
  end: string;
}

/** Домашнее задание (аналог «сообщения» в чате урока). */
export interface Homework {
  id: string;
  lessonId: string;
  /** Календарная дата в формате "2026-09-03" (локальная). */
  date: string;
  text: string;
  completed: boolean;
  /** Unix-время создания, мс. */
  createdAt: number;
}

export interface AppData {
  lessons: Lesson[];
  homework: Homework[];
}

export type ThemeMode = "light" | "dark";

/** Маршруты внутреннего стека навигации. */
export type Route =
  | { type: "main" }
  | { type: "chat"; lessonId: string; focusId?: string | null }
  | { type: "settings" }
  | { type: "calendar" };
