import React from 'react';
import {
  UnidadVeterinariaLogoHorizontal,
  UnidadVeterinariaLogoVertical,
  UnidadVeterinariaLogoBadge
} from './UnidadVeterinariaLogo';
import { GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-slate-800">
          
          {/* Logo Variant 1: Horizontal */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Isologotipo Horizontal
            </span>
            <UnidadVeterinariaLogoHorizontal />
          </div>

          {/* Logo Variant 2: Vertical */}
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Isologotipo Vertical
            </span>
            <UnidadVeterinariaLogoVertical className="scale-90" />
          </div>

          {/* Logo Variant 3: Circular Badge */}
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Emblema Oficial
            </span>
            <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60">
              <UnidadVeterinariaLogoBadge className="w-12 h-12" />
              <div className="text-left text-xs">
                <p className="font-bold text-white">Unidad Veterinaria</p>
                <p className="text-slate-400">Facultad de Ciencias Veterinarias</p>
                <p className="text-emerald-400 font-mono text-[10px]">UNR • Casilda</p>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright and Info */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>
              Plan de Estudios 2009 • Resolución C.D. Nº 30/2026 FCV-UNR
            </span>
          </div>

          <p className="text-center sm:text-right">
            Desarrollado para estudiantes de Medicina Veterinaria - Casilda
          </p>
        </div>
      </div>
    </footer>
  );
};
