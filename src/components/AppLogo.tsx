import logoUv from '../../assets/logo-uv-original.png';

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
