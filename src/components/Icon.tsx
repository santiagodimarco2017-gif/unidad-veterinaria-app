// Íconos SVG inline (trazo 24×24, estilo línea redondeada). Sin dependencias.
import type { CSSProperties, ReactNode } from 'react';

const P = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
  swap: <><path d="M7 4 3 8l4 4" /><path d="M3 8h13" /><path d="m17 20 4-4-4-4" /><path d="M21 16H8" /></>,
  bus: <><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M4 11h16" /><circle cx="8" cy="14.5" r="1" /><circle cx="16" cy="14.5" r="1" /><path d="M6.5 18v2.5M17.5 18v2.5" /><path d="M8 6.5h8" /></>,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  share: <><path d="M12 3v12" /><path d="m7.5 7.5 4.5-4.5 4.5 4.5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  calendarPlus: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5" /></>,
  phone: <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />,
  whatsapp: <><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.3 3.2Z" /><path d="M9 8.5c0 3.5 2.8 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1.2-.5-2.3-1.6-2.8-2.8l.9-1-1-2Z" /></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17 7h.01" /></>,
  alert: <><path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4.5M12 17h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5h.01" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.8-4" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.8 4" /><path d="M20 20v-4h-4" /></>,
  chart: <><path d="M4 20h16" /><rect x="5.5" y="11" width="3" height="6.5" rx="1" /><rect x="10.5" y="6" width="3" height="11.5" rx="1" /><rect x="15.5" y="9" width="3" height="8.5" rx="1" /></>,
  car: <><path d="M5 16.5V12l2-5a2 2 0 0 1 1.9-1.3h6.2A2 2 0 0 1 17 7l2 5v4.5" /><path d="M3.5 12h17v4.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z" /><path d="M6 17.5V20M18 17.5V20" /><circle cx="7.5" cy="14.5" r=".8" /><circle cx="16.5" cy="14.5" r=".8" /><path d="M10 3.5h4" /></>,
  filter: <path d="M3.5 5h17l-6.5 8v5.5l-4 2V13Z" />,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
  cloud: <path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18.5Z" />,
  partly: <><path d="M9 4.2V3M4.6 6l-.9-.9M3 10.3H1.8M14.4 5.1l.8-.8" /><path d="M6.2 11.6a3.5 3.5 0 0 1 6.3-3" /><path d="M9 19.5a3.8 3.8 0 0 1-.4-7.6 5 5 0 0 1 9.6 1.3 3.2 3.2 0 0 1-.4 6.3Z" /></>,
  rain: <><path d="M7 15a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 15" /><path d="m8 18-1 2.5M12.5 18l-1 2.5M17 18l-1 2.5" /></>,
  storm: <><path d="M7 15a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 15" /><path d="m12.5 13-2.5 4h3.5l-2 4" /></>,
  fog: <><path d="M7 12a4.5 4.5 0 0 1 .2-6.8 6 6 0 0 1 10.6 2.4" /><path d="M4 15h16M6 18.5h12M8 22h8" /></>,
  snow: <><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  locate: <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  building: <><rect x="4" y="3" width="11" height="18" rx="1.5" /><path d="M15 9h4a1 1 0 0 1 1 1v11H15M7.5 7h4M7.5 11h4M7.5 15h4M3 21h18" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h11l-1.8 4L16 12H5" /></>,
  edit: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  text: <><path d="M4 19 9 5l5 14M5.8 14.5h6.4" /><path d="M15 19l3-8 3 8M15.9 16.6h4.2" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.7-1.2-2.8 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="14.5" cy="7" r="1" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.3A5 5 0 0 1 12 6.3a5 5 0 0 1 9.2 4.4C19.5 15.4 12 20 12 20Z" />,
  arrowRight: <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
  dot: <circle cx="12" cy="12" r="4" />,
  signal: <><path d="M5 12a7 7 0 0 1 14 0" opacity=".45" /><path d="M8.5 12a3.5 3.5 0 0 1 7 0" /><circle cx="12" cy="12" r="1" /></>,
  graduationCap: <><path d="M2.5 9.5 12 5l9.5 4.5L12 14Z" /><path d="M6.5 11.6v4.6c0 1.3 2.5 2.8 5.5 2.8s5.5-1.5 5.5-2.8v-4.6" /><path d="M21.5 9.5v5.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2.5" /><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  book: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5Z" /><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" /><path d="M9 7.5h6" /></>,
  sparkle: <path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof P;

interface Props {
  name: IconName;
  size?: number;
  fill?: boolean;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function Icon({ name, size = 22, fill = false, stroke = 1.9, className, style, title }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {P[name]}
    </svg>
  );
}

/** Ícono de clima según código WMO */
export function iconoClima(codigo: number, noche: boolean): IconName {
  if (codigo === 0) return noche ? 'moon' : 'sun';
  if (codigo <= 2) return noche ? 'moon' : 'partly';
  if (codigo === 3) return 'cloud';
  if (codigo === 45 || codigo === 48) return 'fog';
  if (codigo >= 95) return 'storm';
  if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) return 'snow';
  if (codigo >= 51) return 'rain';
  return 'cloud';
}
