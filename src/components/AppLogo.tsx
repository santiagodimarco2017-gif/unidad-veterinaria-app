import logoUv from '../../assets/logo-uv-original.png';
import siluetaUv from '../../assets/logo-uv-silueta-blanca.png';

/** Logo de la app: isotipo de Unidad Veterinaria (círculo verde con siluetas de caballo/vaca/cerdo). */
export function AppLogo({ size = 64 }: { size?: number }) {
  return (
    <img
      src={logoUv}
      width={size}
      height={size}
      className="app-logo"
      alt="Unidad Veterinaria"
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}

/**
 * Marca de agua: silueta blanca del logo sobre transparente (assets/logo-uv-silueta-blanca.png,
 * generada con assets/silueta.mjs). Decorativa: va detrás del contenido sobre fondos verdes.
 */
export function MarcaDeAgua({ className = '' }: { className?: string }) {
  return <img src={siluetaUv} className={`marca-agua ${className}`} alt="" aria-hidden draggable={false} />;
}
