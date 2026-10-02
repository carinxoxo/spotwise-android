// Runs after `npx cap add android` (in GitHub Actions).
// Makes the generated Android project ready for a signed Spotwise release.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BG = "#0c1322";
const run = Number(process.env.GITHUB_RUN_NUMBER || 1);
const versionCode = 100 + run;
const versionName = `2.0.${run}`;

function patch(file, fn) {
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
  const before = readFileSync(file, "utf8");
  const after = fn(before);
  if (after === before) throw new Error(`Nothing changed in ${file}`);
  writeFileSync(file, after);
  console.log(`patched ${file}`);
}

// 1. Version + release signing (keystore comes from GitHub secrets)
patch("android/app/build.gradle", (s) =>
  s
    .replace(/versionCode \d+/, `versionCode ${versionCode}`)
    .replace(/versionName "[^"]*"/, `versionName "${versionName}"`)
    .replace(
      /buildTypes \{\s*release \{/,
      `signingConfigs {
        release {
            storeFile file(System.getenv("SPOTWISE_KEYSTORE_PATH") ?: "spotwise-release.jks")
            storePassword System.getenv("SPOTWISE_KEYSTORE_PASSWORD")
            keyAlias System.getenv("SPOTWISE_KEY_ALIAS") ?: "spotwise"
            keyPassword System.getenv("SPOTWISE_KEYSTORE_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release`,
    ),
);

// 2. Dark Spotwise colours everywhere (status bar, navigation bar, splash, window)
patch("android/app/src/main/res/values/styles.xml", (s) =>
  s
    .replace(
      /(<style name="AppTheme.NoActionBar"[^>]*>)/,
      `$1
        <item name="android:windowBackground">@color/spotwiseBg</item>
        <item name="android:statusBarColor">@color/spotwiseBg</item>
        <item name="android:navigationBarColor">@color/spotwiseBg</item>
        <item name="android:windowLightStatusBar">false</item>`,
    )
    .replace(
      /(<style name="AppTheme.NoActionBarLaunch"[^>]*>)/,
      `$1
        <item name="windowSplashScreenBackground">@color/spotwiseBg</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
        <item name="android:statusBarColor">@color/spotwiseBg</item>
        <item name="android:navigationBarColor">@color/spotwiseBg</item>`,
    )
    .replace(/<resources>/, `<resources>\n    <color name="spotwiseBg">${BG}</color>`),
);

console.log(`Spotwise Android ready: versionName ${versionName}, versionCode ${versionCode}`);

// 3. Notifications: Firebase config, small white status-bar icon, default channel.
if (!existsSync("google-services.json")) {
  throw new Error("google-services.json is missing. Download it from Firebase (Project settings -> Your apps -> Android) and upload it to the repository main page.");
}
cpSync("google-services.json", "android/app/google-services.json");
cpSync("native/res", "android/app/src/main/res", { recursive: true });
mkdirSync("android/app/src/main/res/values", { recursive: true });
patch("android/app/src/main/res/values/styles.xml", (s) =>
  s.replace(/<resources>/, `<resources>\n    <color name="spotwiseAccent">#7390ff</color>`),
);
patch("android/app/src/main/AndroidManifest.xml", (s) =>
  s
    .replace(
      /<application([^>]*)>/,
      `<application$1>
        <meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/ic_stat_spotwise" />
        <meta-data android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/spotwiseAccent" />
        <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="spotwise_alerts" />`,
    )
    .replace(/(<uses-permission android:name="android.permission.INTERNET" \/>)/, `$1\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`),
);
// 4. Native notifications: our own Firebase service + start-up code (no web bridge needed).
cpSync("native/java", "android/app/src/main/java/com/spotwise/app", { recursive: true });
patch("android/app/build.gradle", (s) =>
  s.replace(/dependencies \{/, `dependencies {\n    implementation "com.google.firebase:firebase-messaging:24.1.0"`),
);
patch("android/app/src/main/AndroidManifest.xml", (s) =>
  s.replace(
    /<\/application>/,
    `    <service android:name=".SpotwiseMessagingService" android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>`,
  ),
);
console.log("Notifications ready (Firebase topic + native service + icon + channel)");
