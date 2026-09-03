import type { ReactNode } from "react";

/** Единый набор inline-SVG иконок (stroke = currentColor). */

interface IconProps {
  size?: number;
  className?: string;
  sw?: number;
}

function S({
  children,
  size = 20,
  className,
  sw = 2,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconBack = (p: IconProps) => (
  <S {...p}><path d="M15 18l-6-6 6-6" /></S>
);
export const IconPlus = (p: IconProps) => (
  <S {...p}><path d="M12 5v14M5 12h14" /></S>
);
export const IconDots = ({ size = 20, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="12" cy="5" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="12" cy="19" r="1.9" />
  </svg>
);
export const IconSearch = (p: IconProps) => (
  <S {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></S>
);
export const IconGear = (p: IconProps) => (
  <S {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);
export const IconSun = (p: IconProps) => (
  <S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></S>
);
export const IconMoon = (p: IconProps) => (
  <S {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></S>
);
export const IconCalendar = (p: IconProps) => (
  <S {...p}><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M16 2v4M8 2v4M3 9.5h18" /></S>
);
export const IconClock = (p: IconProps) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 1.8" /></S>
);
export const IconCheck = (p: IconProps) => (
  <S {...p}><path d="M20 6L9 17l-5-5" /></S>
);
/** Двойная галочка (задание выполнено). */
export const IconChecks = (p: IconProps) => (
  <S {...p}><path d="M18 6L7 17l-4-4" /><path d="M22 10l-7.5 7.5L13 16" /></S>
);
export const IconChevronL = (p: IconProps) => (
  <S {...p}><path d="M15 18l-6-6 6-6" /></S>
);
export const IconChevronR = (p: IconProps) => (
  <S {...p}><path d="M9 6l6 6-6 6" /></S>
);
export const IconClose = (p: IconProps) => (
  <S {...p}><path d="M18 6L6 18M6 6l12 12" /></S>
);
export const IconPencil = (p: IconProps) => (
  <S {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></S>
);
export const IconTrash = (p: IconProps) => (
  <S {...p}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></S>
);
export const IconReset = (p: IconProps) => (
  <S {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></S>
);
export const IconBook = (p: IconProps) => (
  <S {...p}>
    <path d="M2.5 4.5c3.2-1.6 6.3-1.6 9.5 0 3.2-1.6 6.3-1.6 9.5 0v15c-3.2-1.6-6.3-1.6-9.5 0-3.2-1.6-6.3-1.6-9.5 0z" />
    <path d="M12 4.5v15" />
  </S>
);
export const IconInbox = (p: IconProps) => (
  <S {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z" /></S>
);
export const IconChevronDown = (p: IconProps) => (
  <S {...p}><path d="M6 9l6 6 6-6" /></S>
);

/* Статус-бар «телефона» */
export const IconSignal = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="2" y="14" width="4" height="7" rx="1" />
    <rect x="8" y="10" width="4" height="11" rx="1" />
    <rect x="14" y="6" width="4" height="15" rx="1" />
    <rect x="20" y="2" width="4" height="19" rx="1" opacity=".35" />
  </svg>
);
export const IconWifi = ({ size = 15, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 19.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z" />
    <path d="M12 13.2c-2.5 0-4.8 1-6.5 2.6l2 2.1A6.7 6.7 0 0 1 12 16.2c1.7 0 3.3.6 4.5 1.7l2-2.1a9.6 9.6 0 0 0-6.5-2.6z" />
    <path d="M12 6.5c-4.3 0-8.2 1.7-11 4.4l2 2.1A12.5 12.5 0 0 1 12 9.5c3.4 0 6.5 1.3 8.9 3.5l2-2.1A15.5 15.5 0 0 0 12 6.5z" opacity=".85" />
  </svg>
);
export const IconBattery = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 28 14" fill="none" className={className} aria-hidden="true">
    <rect x="0.75" y="0.75" width="23.5" height="12.5" rx="3.5" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.5" />
    <rect x="3" y="3" width="17" height="8" rx="2" fill="currentColor" />
    <path d="M26.5 5v4a2.2 2.2 0 0 0 0-4z" fill="currentColor" fillOpacity=".4" />
  </svg>
);
