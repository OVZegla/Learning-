export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`lp-logo ${className}`} style={{ height: size }}>
      <svg viewBox="0 0 220 44" xmlns="http://www.w3.org/2000/svg" aria-label="Learning+">
        <path
          d="M 10 32 L 200 32 Q 212 32 212 24 Q 212 16 200 16 L 196 16"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="lp-logo-line"
        />
        <text
          x="10" y="28"
          fontFamily="'Inter Tight', sans-serif"
          fontWeight={800}
          fontSize={28}
          letterSpacing="-0.04em"
          className="lp-logo-ink"
        >
          LEARNING
        </text>
        <text
          x="178" y="22"
          fontFamily="'Inter Tight', sans-serif"
          fontWeight={700}
          fontSize={22}
          className="lp-logo-ink"
        >
          +
        </text>
      </svg>
    </span>
  );
}
