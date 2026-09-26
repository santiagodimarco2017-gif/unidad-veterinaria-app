// Gráfico de barras (SVG puro) de salidas por hora.
export function FrecuenciaChart({ porHora, max, horaActual, alto = 150, compacto = false, etiqueta }: {
  porHora: number[];
  max?: number;
  horaActual?: number | null;
  alto?: number;
  compacto?: boolean;
  etiqueta: string;
}) {
  const tope = Math.max(1, max ?? Math.max(...porHora));
  const W = 24 * 14;
  const labelH = compacto ? 0 : 16;
  const topPad = compacto ? 2 : 14;
  const H = alto;
  const areaH = H - labelH - topPad;
  const bw = 9;
  const resumen = porHora.map((n, h) => (n ? `${h} h: ${n}` : '')).filter(Boolean).join(', ');

  return (
    <svg
      className={`fchart${compacto ? ' fchart--mini' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${etiqueta}. ${resumen || 'Sin salidas'}`}
    >
      {!compacto && [0.5, 1].map((f) => (
        <line key={f} x1="0" x2={W} y1={topPad + areaH * (1 - f)} y2={topPad + areaH * (1 - f)} className="fchart__grid" />
      ))}
      <line x1="0" x2={W} y1={topPad + areaH} y2={topPad + areaH} className="fchart__base" />
      {porHora.map((n, h) => {
        const bh = n ? Math.max(3, (n / tope) * areaH) : 0;
        const x = h * 14 + (14 - bw) / 2;
        const y = topPad + areaH - bh;
        const actual = horaActual === h;
        return (
          <g key={h}>
            {n > 0 && (
              <rect
                x={x} y={y} width={bw} height={bh} rx={3}
                className={`fchart__bar${actual ? ' is-now' : ''}`}
                style={{ ['--d' as string]: `${h * 18}ms` }}
              />
            )}
            {!compacto && n > 0 && (
              <text x={x + bw / 2} y={y - 3} className="fchart__val" textAnchor="middle">{n}</text>
            )}
            {!compacto && h % 3 === 0 && (
              <text x={h * 14 + 7} y={H - 3} className={`fchart__lbl${actual ? ' is-now' : ''}`} textAnchor="middle">{h}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
