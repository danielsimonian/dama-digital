import type { ReactNode } from 'react';

/* Ilustrações em traço fino — mesma espessura das hairlines (1px).
   viewBox 80×56, sem preenchimento, cor = currentColor. */

function Art({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <svg
      viewBox="0 0 80 56"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="square"
      vectorEffect="non-scaling-stroke"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="h-14 w-20"
    >
      {children}
    </svg>
  );
}

const fill = { fill: 'currentColor', stroke: 'none' } as const;

export const LINE_ART = {
  sites: (
    <Art>
      <rect x="14" y="8" width="52" height="40" />
      <path d="M14 16h52" />
      <circle cx="19" cy="12" r="1" {...fill} />
      <circle cx="23" cy="12" r="1" {...fill} />
      <path d="M20 24h22M20 29h16M20 34h19" opacity={0.6} />
      <rect x="48" y="23" width="12" height="14" strokeDasharray="2 2" />
    </Art>
  ),
  sistemas: (
    <Art>
      <rect x="35" y="6" width="10" height="8" />
      <path d="M40 14v8M22 22h36M22 22v6M40 22v6M58 22v6" />
      <rect x="17" y="28" width="10" height="8" />
      <rect x="35" y="28" width="10" height="8" />
      <rect x="53" y="28" width="10" height="8" {...fill} />
      <path d="M22 36v6M58 36v6" strokeDasharray="2 2" />
      <rect x="18" y="42" width="8" height="6" />
      <rect x="54" y="42" width="8" height="6" />
    </Art>
  ),
  transmissao: (
    <Art>
      <circle cx="40" cy="28" r="2.5" {...fill} />
      <path d="M33 21a10 10 0 0 0 0 14M47 21a10 10 0 0 1 0 14" />
      <path d="M27 15a18 18 0 0 0 0 26M53 15a18 18 0 0 1 0 26" opacity={0.6} />
      <path d="M21 9a26 26 0 0 0 0 38M59 9a26 26 0 0 1 0 38" opacity={0.3} />
    </Art>
  ),
  torneios: (
    <Art>
      <rect x="12" y="10" width="56" height="36" />
      <path d="M40 10v36" strokeWidth={1.5} />
      <path d="M12 18h56M12 38h56" opacity={0.6} />
      <path d="M26 18v20M54 18v20" strokeDasharray="2 2" opacity={0.6} />
      <circle cx="31" cy="24" r="1.5" {...fill} />
    </Art>
  ),
  fotografia: (
    <Art>
      <circle cx="40" cy="28" r="18" />
      <circle cx="40" cy="28" r="7" />
      <path d="M40 10 46 22M56 22l-9 6M54 40l-11-6M37 46l-3-12M23 38l10-7M25 16l9 9" opacity={0.6} />
    </Art>
  ),
  musica: (
    <Art>
      {[6, 14, 22, 10, 30, 18, 36, 24, 12, 28, 16, 8, 20].map((h, i) => (
        <path key={i} d={`M${16 + i * 4} ${28 - h / 2}v${h}`} />
      ))}
      <path d="M10 28h60" strokeDasharray="1 3" opacity={0.4} />
    </Art>
  ),
  mixagem: (
    <Art>
      {[30, 18, 36, 24, 14].map((y, i) => (
        <g key={i}>
          <path d={`M${20 + i * 10} 8v40`} opacity={0.5} />
          <rect x={17 + i * 10} y={y} width="6" height="4" {...(i === 2 ? fill : {})} />
        </g>
      ))}
    </Art>
  ),
  distribuicao: (
    <Art>
      <circle cx="14" cy="28" r="2" {...fill} />
      {[8, 16, 24, 32, 40, 48].map((y) => (
        <g key={y}>
          <path d={`M16 28C34 28 40 ${y} 58 ${y}`} opacity={0.7} />
          <circle cx="62" cy={y} r="1.5" />
        </g>
      ))}
    </Art>
  ),
  aulas: (
    <Art>
      {[16, 22, 28, 34, 40].map((y) => (
        <path key={y} d={`M10 ${y}h60`} opacity={0.5} />
      ))}
      <circle cx="28" cy="34" r="3" {...fill} />
      <path d="M31 34V14" />
      <circle cx="44" cy="25" r="3" />
      <path d="M47 25V8" />
      <circle cx="58" cy="31" r="3" {...fill} />
      <path d="M61 31V12" />
    </Art>
  ),
  branding: (
    <Art>
      <rect x="22" y="6" width="44" height="44" opacity={0.4} />
      <circle cx="44" cy="28" r="22" />
      <circle cx="44" cy="28" r="11" />
      <path d="M22 6l44 44M66 6 22 50" strokeDasharray="2 2" opacity={0.5} />
      <path d="M14 28h60M44 2v52" opacity={0.3} />
    </Art>
  ),
} as const;

export type LineArtKey = keyof typeof LINE_ART;

