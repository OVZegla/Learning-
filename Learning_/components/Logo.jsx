// Learning+ logo — geometric wordmark with continuous underline stroke
function LPLogo({ size = 28, className = '' }) {
  return (
    <span className={`lp-logo ${className}`} style={{ height: size }}>
      <svg viewBox="0 0 220 44" xmlns="http://www.w3.org/2000/svg" aria-label="Learning+">
        {/* continuous thin underline stroke that loops below letters */}
        <path
          d="M 10 32 L 200 32 Q 212 32 212 24 Q 212 16 200 16 L 196 16"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="lp-logo-line"
        />
        {/* Wordmark — geometric sans, heavy weight, tight tracking */}
        <text
          x="10"
          y="28"
          fontFamily="'Inter Tight', sans-serif"
          fontWeight="800"
          fontSize="28"
          letterSpacing="-0.04em"
          className="lp-logo-ink"
          style={{ fontStretch: 'condensed' }}
        >
          LEARNING
        </text>
        {/* plus glyph */}
        <text
          x="178"
          y="22"
          fontFamily="'Inter Tight', sans-serif"
          fontWeight="700"
          fontSize="22"
          className="lp-logo-ink"
        >
          +
        </text>
      </svg>
    </span>
  );
}

// Mark-only variant (for favicon-ish uses)
function LPMark({ size = 32 }) {
  return (
    <span className="lp-logo" style={{ height: size }}>
      <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="40" height="40" rx="12" className="lp-logo-ink" />
        <text
          x="22" y="30"
          textAnchor="middle"
          fontFamily="'Inter Tight', sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="var(--bg)"
          letterSpacing="-0.04em"
        >
          L+
        </text>
      </svg>
    </span>
  );
}

window.LPLogo = LPLogo;
window.LPMark = LPMark;
