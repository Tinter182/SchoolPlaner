import { PALETTES } from "../data/seed";

/** Градиентная аватарка предмета (Telegram-стиль, свои палитры). */
export function Avatar({
  icon,
  color,
  size = 48,
  className = "",
}: {
  icon: string;
  color: number;
  size?: number;
  className?: string;
}) {
  const [a, b] = PALETTES[Math.abs(color) % PALETTES.length];
  return (
    <div
      className={`flex shrink-0 select-none items-center justify-center rounded-full shadow-sm ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
        fontSize: Math.round(size * 0.46),
      }}
      aria-hidden="true"
    >
      <span className="leading-none drop-shadow-sm">{icon}</span>
    </div>
  );
}
