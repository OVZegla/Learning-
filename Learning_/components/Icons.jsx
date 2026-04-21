// Shared icons — stroke-based, 1.6 stroke, 24px viewBox
const iconProps = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
};

const Ico = {
  play: (p = {}) => <svg {...iconProps} {...p}><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg>,
  arrow: (p = {}) => <svg {...iconProps} {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrowLeft: (p = {}) => <svg {...iconProps} {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  check: (p = {}) => <svg {...iconProps} {...p}><path d="M20 6L9 17l-5-5"/></svg>,
  plus: (p = {}) => <svg {...iconProps} {...p}><path d="M12 5v14M5 12h14"/></svg>,
  search: (p = {}) => <svg {...iconProps} {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  home: (p = {}) => <svg {...iconProps} {...p}><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>,
  book: (p = {}) => <svg {...iconProps} {...p}><path d="M4 4v16a2 2 0 012-2h14V4H6a2 2 0 00-2 2z"/><path d="M4 18h16"/></svg>,
  award: (p = {}) => <svg {...iconProps} {...p}><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/></svg>,
  sparkle: (p = {}) => <svg {...iconProps} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
  bell: (p = {}) => <svg {...iconProps} {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>,
  user: (p = {}) => <svg {...iconProps} {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  settings: (p = {}) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>,
  close: (p = {}) => <svg {...iconProps} {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>,
  menu: (p = {}) => <svg {...iconProps} {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  sun: (p = {}) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon: (p = {}) => <svg {...iconProps} {...p}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>,
  clock: (p = {}) => <svg {...iconProps} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  flame: (p = {}) => <svg {...iconProps} {...p}><path d="M12 2s4 5 4 9a4 4 0 01-8 0c0-1 .5-2 1-3-2 1-4 3-4 6a7 7 0 0014 0c0-5-7-12-7-12z"/></svg>,
  google: (p = {}) => <svg width="18" height="18" viewBox="0 0 48 48" {...p}>
    <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.2-.4-4.7H24v9h11.8c-.5 2.7-2 5-4.3 6.5v5.4h7c4.1-3.8 6.5-9.4 6.5-16.2z"/>
    <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.3l-7-5.4c-1.9 1.3-4.4 2.1-7.3 2.1-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6A22 22 0 0024 46z"/>
    <path fill="#FBBC05" d="M11.9 28.5A13 13 0 0111.2 24c0-1.6.3-3.1.7-4.5v-5.6H4.7a22 22 0 000 20.2l7.2-5.6z"/>
    <path fill="#EA4335" d="M24 11a12 12 0 018.4 3.3l6.3-6.3A22 22 0 004.7 13.9l7.2 5.6C13.6 14.8 18.4 11 24 11z"/>
  </svg>,
  star: (p = {}) => <svg {...iconProps} {...p}><path d="M12 2l3 7 7 .7-5.3 4.7 1.6 7.2L12 18l-6.3 3.6 1.6-7.2L2 9.7 9 9z" fill="currentColor" stroke="none"/></svg>,
  dots: (p = {}) => <svg {...iconProps} {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></svg>,
};

window.Ico = Ico;
