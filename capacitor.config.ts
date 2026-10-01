import type { CapacitorConfig } from "@capacitor/cli";

// Spotwise Android app.
// The app opens the live Spotwise site inside its own Android WebView (not Chrome),
// so every website update reaches the app instantly without a new APK.
const SITE = "https://spotwise-app.vercel.app";
const BG = "#0c1322";

const config: CapacitorConfig = {
  appId: "com.spotwise.app",
  appName: "Spotwise",
  webDir: "www",
  backgroundColor: BG,
  server: {
    url: SITE,
    cleartext: false,
    // Shown when there is no internet.
    errorPath: "offline.html",
    // Only Spotwise stays inside the app; other links (X, Gmail, Binance) open outside.
    allowNavigation: ["spotwise-app.vercel.app"],
  },
  android: {
    // Lets the website know it runs inside the real app.
    appendUserAgent: "SpotwiseApp/2",
    adjustMarginsForEdgeToEdge: "force",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: BG,
      showSpinner: false,
      androidScaleType: "CENTER_INSIDE",
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: BG,
      overlaysWebView: false,
    },
  },
};

export default config;
