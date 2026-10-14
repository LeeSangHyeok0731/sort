type IconProps = { className?: string };

const base = "w-4 h-4";

export function PlayIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function PauseIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function StepForwardIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 6.5v11a1 1 0 0 0 1.53.85l8.5-5.5a1 1 0 0 0 0-1.7l-8.5-5.5A1 1 0 0 0 6 6.5Z" />
      <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
    </svg>
  );
}

export function StepBackIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} -scale-x-100`} aria-hidden>
      <path d="M6 6.5v11a1 1 0 0 0 1.53.85l8.5-5.5a1 1 0 0 0 0-1.7l-8.5-5.5A1 1 0 0 0 6 6.5Z" />
      <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
    </svg>
  );
}

export function RewindIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 12a8 8 0 1 0 2.5-5.8" />
      <path d="M4 4v4.5h4.5" />
    </svg>
  );
}

export function ShuffleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M16 4h4v4" />
      <path d="M4 20 20 4" />
      <path d="M20 16v4h-4" />
      <path d="m15 15 5 5" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

export function SpinnerIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
