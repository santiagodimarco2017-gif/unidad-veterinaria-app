import type { CSSProperties } from 'react';
import type { EmpresaId } from '../lib/types';
import { EMPRESAS } from '../data';

/** Texto legible sobre un color de fondo hex */
export function textoSobre(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.padEnd(6, '0');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#10151c' : '#ffffff';
}

export function colorEmpresa(id: EmpresaId): string {
  return EMPRESAS[id]?.color ?? '#6b7280';
}

export function nombreEmpresa(id: EmpresaId): string {
  return EMPRESAS[id]?.nombre ?? 'Otra empresa';
}

interface Props {
  empresa: EmpresaId;
  variante?: 'solido' | 'suave';
  className?: string;
}

export function EmpresaChip({ empresa, variante = 'suave', className = '' }: Props) {
  const color = colorEmpresa(empresa);
  const style = (variante === 'solido'
    ? { background: color, color: textoSobre(color) }
    : { '--chip-color': color }) as CSSProperties;
  return (
    <span className={`empresa-chip empresa-chip--${variante} ${className}`} style={style}>
      {variante === 'suave' && <span className="empresa-chip__dot" aria-hidden />}
      {nombreEmpresa(empresa)}
    </span>
  );
}
