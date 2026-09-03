import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, Homework, Lesson, ThemeMode, Weekday } from "../types";
import { seedData, uid } from "../data/seed";

/**
 * Всё состояние приложения живёт в localStorage и переживает перезапуск.
 * Демо-данные создаются только один раз — при первом запуске.
 */

const DATA_KEY = "dnevnik:data:v1";
const THEME_KEY = "dnevnik:theme";

interface StoreValue {
  lessons: Lesson[];
  homework: Homework[];
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  /** true, если сохранённые данные не удалось прочитать (загружено демо). */
  loadError: boolean;
  addLesson: (data: Omit<Lesson, "id">) => Lesson;
  updateLesson: (id: string, patch: Partial<Omit<Lesson, "id">>) => void;
  deleteLesson: (id: string) => void;
  addHomework: (lessonId: string, date: string, text: string) => Homework;
  toggleHomework: (id: string) => Homework | null;
  resetDemo: () => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

function loadInitial(): { data: AppData; error: boolean } {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return { data: seedData(), error: false };
    const parsed = JSON.parse(raw) as AppData;
    if (!Array.isArray(parsed.lessons) || !Array.isArray(parsed.homework)) {
      throw new Error("bad shape");
    }
    return { data: parsed, error: false };
  } catch {
    return { data: seedData(), error: true };
  }
}

function loadTheme(): ThemeMode {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Одно чтение хранилища за всё время жизни приложения.
  const [initial] = useState(loadInitial);
  const [{ lessons, homework }, setData] = useState<AppData>(initial.data);
  const [loadError] = useState(initial.error);
  const [theme, setThemeState] = useState<ThemeMode>(loadTheme);

  // Персист данных при каждом изменении.
  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify({ lessons, homework }));
    } catch {
      /* приватный режим и т.п. — молча пропускаем */
    }
  }, [lessons, homework]);

  // Тема: class на <html> + localStorage.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch { /* noop */ }
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);

  const addLesson = useCallback((data: Omit<Lesson, "id">) => {
    const lesson: Lesson = { ...data, id: uid() };
    setData((s) => ({ ...s, lessons: [...s.lessons, lesson] }));
    return lesson;
  }, []);

  const updateLesson = useCallback((id: string, patch: Partial<Omit<Lesson, "id">>) => {
    setData((s) => ({
      ...s,
      lessons: s.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }, []);

  /** Удаление урока вместе со всеми его заданиями (с подтверждением в UI). */
  const deleteLesson = useCallback((id: string) => {
    setData((s) => ({
      lessons: s.lessons.filter((l) => l.id !== id),
      homework: s.homework.filter((h) => h.lessonId !== id),
    }));
  }, []);

  const addHomework = useCallback((lessonId: string, date: string, text: string) => {
    const hw: Homework = {
      id: uid(),
      lessonId,
      date,
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setData((s) => ({ ...s, homework: [...s.homework, hw] }));
    return hw;
  }, []);

  const toggleHomework = useCallback((id: string) => {
    let updated: Homework | null = null;
    setData((s) => ({
      ...s,
      homework: s.homework.map((h) => {
        if (h.id !== id) return h;
        updated = { ...h, completed: !h.completed };
        return updated;
      }),
    }));
    return updated;
  }, []);

  const resetDemo = useCallback(() => {
    setData(seedData());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      lessons,
      homework,
      theme,
      setTheme,
      loadError,
      addLesson,
      updateLesson,
      deleteLesson,
      addHomework,
      toggleHomework,
      resetDemo,
    }),
    [lessons, homework, theme, setTheme, loadError, addLesson, updateLesson, deleteLesson, addHomework, toggleHomework, resetDemo],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore вне StoreProvider");
  return ctx;
}

/* ---------- Чистые селекторы ---------- */

/** Уроки дня, отсортированные по времени начала. */
export function lessonsForDay(lessons: Lesson[], day: Weekday): Lesson[] {
  return lessons
    .filter((l) => l.weekday === day)
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}

/** Задания урока, отсортированные по дате (затем по времени создания). */
export function homeworkOfLesson(homework: Homework[], lessonId: string): Homework[] {
  return homework
    .filter((h) => h.lessonId === lessonId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
}

/** Последнее задание урока (для превью в списке чатов). */
export function lastHomework(hws: Homework[]): Homework | null {
  return hws.length ? hws[hws.length - 1] : null;
}

export function pendingCount(hws: Homework[]): number {
  return hws.filter((h) => !h.completed).length;
}
