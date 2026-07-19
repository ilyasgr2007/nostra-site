import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.nostra.app",
  appName: "NOSTRA",
  webDir: "public",
  server: {
    // The app loads your live website directly inside the native shell.
    // Every update you push to Vercel appears instantly in the app too —
    // no need to rebuild/republish the app for regular content changes.
    url: "https://nostra-site-wwhg.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
