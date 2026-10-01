# Spotwise Android app

Real Android app for Spotwise (Capacitor). It opens https://spotwise-app.vercel.app
inside its own app window, with the Spotwise icon, splash and dark status bar.

GitHub builds the signed APK automatically on every upload (Actions tab).
The APK appears under **Releases** on the right side of this page.

Secrets needed (Settings -> Secrets and variables -> Actions):
- SPOTWISE_KEYSTORE_BASE64
- SPOTWISE_KEYSTORE_PASSWORD
