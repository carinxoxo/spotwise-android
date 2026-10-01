// Runs after `npx cap add android` (in GitHub Actions).
// Makes the generated Android project ready for a signed Spotwise release.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

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
