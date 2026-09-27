import type { CapacitorConfig } from '@capacitor/cli';

/** Acento de marca (ver assets/logo-uv-original.png): verde Unidad Veterinaria. */
const ACCENT_GREEN = '#068136';

const config: CapacitorConfig = {
  appId: 'ar.unidadveterinaria.app',
  appName: 'Unidad Veterinaria',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_bus',
      iconColor: ACCENT_GREEN,
    },
    SplashScreen: {
      backgroundColor: ACCENT_GREEN,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
