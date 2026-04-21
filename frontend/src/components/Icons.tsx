import { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

type Props = SVGProps<SVGSVGElement>;

export const Icon = {
  play: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M8 5v14l11-7z" fill="currentColor" stroke="none" /></svg>
  ),
  arrow: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  ),
  arrowLeft: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
  ),
  check: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M20 6L9 17l-5-5" /></svg>
  ),
  plus: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
  ),
  minus: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M5 12h14" /></svg>
  ),
  search: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
  ),
  home: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>
  ),
  book: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M4 4v16a2 2 0 012-2h14V4H6a2 2 0 00-2 2z" /><path d="M4 18h16" /></svg>
  ),
  award: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="12" cy="9" r="6" /><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" /></svg>
  ),
  sparkle: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>
  ),
  user: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
  ),
  settings: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>
  ),
  close: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M18 6L6 18M6 6l12 12" /></svg>
  ),
  menu: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
  ),
  sun: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  ),
  moon: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>
  ),
  clock: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  flame: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M12 2s4 5 4 9a4 4 0 01-8 0c0-1 .5-2 1-3-2 1-4 3-4 6a7 7 0 0014 0c0-5-7-12-7-12z" /></svg>
  ),
  lock: (p: Props = {}) => (
    <svg {...base} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 118 0v4" /></svg>
  ),
  video: (p: Props = {}) => (
    <svg {...base} {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></svg>
  ),
  file: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
  ),
  image: (p: Props = {}) => (
    <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M21 16l-5-5-9 9" /></svg>
  ),
  dots: (p: Props = {}) => (
    <svg {...base} {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></svg>
  ),
  trash: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" /></svg>
  ),
  edit: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z" /></svg>
  ),
  chevUp: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M6 15l6-6 6 6" /></svg>
  ),
  chevDown: (p: Props = {}) => (
    <svg {...base} {...p}><path d="M6 9l6 6 6-6" /></svg>
  ),
};
