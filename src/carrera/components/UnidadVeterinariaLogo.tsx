import React from 'react';
import logoUV from '../logo-uv.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'vertical' | 'badge';
}

export const UnidadVeterinariaEmblem: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <img src={logoUV} alt="Logo Unidad Veterinaria" className={className} />
  );
};

export const UnidadVeterinariaLogoHorizontal: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-3 bg-[#068136] text-white rounded-2xl p-2 pr-5 shadow-md border border-emerald-600/30 ${className}`}>
      {/* Badge Circle Icon */}
      <div className="w-11 h-11 shrink-0 bg-white/10 rounded-xl p-1 backdrop-blur-xs border border-white/20 flex items-center justify-center">
        <UnidadVeterinariaEmblem className="w-full h-full" />
      </div>

      {/* Text Branding */}
      <div className="flex flex-col justify-center leading-none">
        <span className="text-base sm:text-lg font-black tracking-wider uppercase font-sans text-white">
          UNIDAD
        </span>
        <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase font-sans text-emerald-100 mt-0.5">
          VETERINARIA
        </span>
      </div>
    </div>
  );
};

export const UnidadVeterinariaLogoVertical: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center text-center bg-[#068136] text-white rounded-2xl p-4 shadow-lg border border-emerald-600/30 ${className}`}>
      {/* Big Badge Icon */}
      <UnidadVeterinariaEmblem className="w-20 h-20 mb-2" />

      {/* Text Box */}
      <div className="w-full bg-white text-[#068136] font-black text-xl tracking-widest uppercase py-1 px-3 rounded-lg shadow-xs">
        UNIDAD
      </div>
      <div className="font-extrabold text-sm tracking-widest uppercase text-white mt-1.5">
        VETERINARIA
      </div>
    </div>
  );
};

export const UnidadVeterinariaLogoBadge: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <UnidadVeterinariaEmblem className="w-full h-full drop-shadow-md" />
    </div>
  );
};
