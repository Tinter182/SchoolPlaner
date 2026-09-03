import { useEffect, useState } from "react";
import type { Route } from "./types";
import { StoreProvider } from "./storage/store";
import { NavProvider, useNav } from "./nav";
import { ToastProvider } from "./components/ui";
import { MainScreen } from "./screens/MainScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { formatClock } from "./utils/date";
import { IconBattery, IconSignal, IconWifi } from "./components/icons";

/* ---------- Статус-бар «устройства» с живыми часами ---------- */
function StatusBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="relative z-30 flex h-[32px] shrink-0 items-end justify-between bg-white px-7 pb-[3px] text-ink dark:bg-panel dark:text-white">
      <span className="text-[12px] font-bold tabular-nums">{formatClock(now)}</span>
      <span className="flex items-center gap-1.5 opacity-90">
        <IconSignal size={13} />
        <IconWifi size={14} />
        <IconBattery size={22} />
      </span>
    </div>
  );
}

/* ---------- Плавающие декорации рабочего стола ---------- */
function Float({
  emoji,
  cls,
  rot,
  delay,
}: {
  emoji: string;
  cls: string;
  rot: string;
  delay: string;
}) {
  return (
    <div
      className={`anim-floaty absolute ${cls}`}
      style={{ ["--rot" as never]: rot, animationDelay: delay }}
      aria-hidden="true"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/[0.05] text-[25px] shadow-lg ring-1 ring-white/10 backdrop-blur-[2px]">
        {emoji}
      </div>
    </div>
  );
}

function renderRoute(r: Route) {
  switch (r.type) {
    case "main":
      return <MainScreen />;
    case "chat":
      return <ChatScreen lessonId={r.lessonId} focusId={r.focusId} />;
    case "settings":
      return <SettingsScreen />;
    case "calendar":
      return <CalendarScreen />;
  }
}

/** Оболочка: на телефоне — весь экран, на десктопе — «корпус» телефона. */
function Shell() {
  const { stack, closing, pop } = useNav();
  const top = stack.length - 1;

  return (
    <div className="app-shell-bg relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <Float emoji="📐" cls="left-[13%] top-[18%]" rot="-10deg" delay="0s" />
        <Float emoji="✏️" cls="right-[14%] top-[24%]" rot="8deg" delay="1.2s" />
        <Float emoji="📖" cls="left-[17%] bottom-[22%]" rot="6deg" delay="0.6s" />
        <Float emoji="⚛️" cls="right-[16%] bottom-[18%]" rot="-7deg" delay="1.8s" />
      </div>

      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white dark:bg-night md:h-[min(870px,94vh)] md:w-[400px] md:rounded-[46px] md:border-[10px] md:border-[#0a1218] md:shadow-[0_50px_140px_-30px_rgba(0,0,0,0.85)]">
        <ToastProvider>
          <StatusBar />
          {/* «вырез» камеры — только в корпусном режиме */}
          <div className="pointer-events-none absolute left-1/2 top-[6px] z-[80] hidden h-[20px] w-[104px] -translate-x-1/2 rounded-full bg-[#0a1218] md:block" />

          <div className="relative flex-1 overflow-hidden">
            {stack.map((r, i) => {
              const isTop = i === top;
              return (
                <div
                  key={`${r.type}-${i}`}
                  className={`absolute inset-0 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                    isTop
                      ? closing
                        ? "translate-x-full"
                        : "translate-x-0"
                      : "-translate-x-[28%]"
                  }`}
                >
                  {!isTop && (
                    <div
                      className="absolute inset-0 z-[60] bg-[#0b1c26]/25 transition-opacity duration-300"
                      onClick={pop}
                      aria-hidden="true"
                    />
                  )}
                  {renderRoute(r)}
                </div>
              );
            })}
          </div>
        </ToastProvider>
      </div>

      <p className="absolute bottom-4 hidden text-center text-[11.5px] font-medium tracking-wide text-white/35 md:block">
        Дневник — школьный офлайн-планер · все данные остаются на устройстве
      </p>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <NavProvider>
        <Shell />
      </NavProvider>
    </StoreProvider>
  );
}
