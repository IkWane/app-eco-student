// Icônes du design system : traits de 1,75 px sur une grille 24 x 24.
const PATHS = {
  plus: 'M12 5v14M5 12h14',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  alert: 'M12 3.5l9.5 16.5h-19L12 3.5zM12 10v4.5M12 17.2v.3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.8v.3',
  wallet: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h14V8H6.5A2.5 2.5 0 0 1 4 7.5zM16 13.5h.5',
  receipt: 'M6 3.5h12v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5zM9 8h6M9 11.5h6M9 15h3.5',
  chart: 'M4 20h16M6.5 20v-6M11 20V6M15.5 20v-9M20 20V9',
  pie: 'M11 4.1A8 8 0 1 0 19.9 13H11zM14 3.5v6.5h6.5A7 7 0 0 0 14 3.5z',
  tag: 'M4 4h7l9 9-7 7-9-9zM8 8h.01',
  home: 'M4 11l8-6.5 8 6.5M6 9.5V19h12V9.5M10 19v-5h4v5',
  cart: 'M3.5 5h2.2l2 10h10l1.8-7H7M9.5 19.5h.01M16.5 19.5h.01',
  bus: 'M6 4.5h12a1 1 0 0 1 1 1V16H5V5.5a1 1 0 0 1 1-1zM5 11h14M8 16v3M16 16v3M8.5 13.5h.01M15.5 13.5h.01',
  book: 'M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5zM5 18.5A1.5 1.5 0 0 0 6.5 20H19',
  ticket: 'M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4zM14 6v2M14 11v2M14 16v2',
  heart: 'M12 19s-7-4.35-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 2.5C19 14.65 12 19 12 19z',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10',
} as const

export type IconName = keyof typeof PATHS

type IconProps = {
  name: IconName
  size?: number
  // Une icône seule porte un label ; une icône décorative est masquée aux lecteurs d'écran.
  label?: string
}

export function Icon({ name, size = 20, label }: IconProps) {
  return (
    <svg
      className="bu-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
