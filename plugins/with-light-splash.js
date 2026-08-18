const {
  withAndroidColorsNight,
  withAndroidStyles,
  withAndroidManifest,
  withMainApplication,
  AndroidConfig,
} = require('expo/config-plugins');
const { addImports } = require('@expo/config-plugins/build/android/codeMod');

const SPLASH_BG = '#27A060';
const APP_BG = '#FFFFFF';

function ensureStyleItem(style, name, value) {
  if (!style.item) style.item = [];
  const items = Array.isArray(style.item) ? style.item : [style.item];
  style.item = items;
  const found = items.find((item) => item.$?.name === name);
  if (found) {
    found._ = value;
    return;
  }
  items.push({ $: { name }, _: value });
}

/**
 * Android shows the system splash before JS. Dark mode / force-dark can still
 * paint that window black even when the app is locked to light UI.
 */
function withLightSplash(config) {
  config = withAndroidColorsNight(config, (cfg) => {
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: 'splashscreen_background',
      value: SPLASH_BG,
    });
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: 'activityBackground',
      value: APP_BG,
    });
    return cfg;
  });

  config = withAndroidStyles(config, (cfg) => {
    for (const style of cfg.modResults.resources.style || []) {
      const name = style.$?.name;
      if (name === 'AppTheme') {
        ensureStyleItem(style, 'android:forceDarkAllowed', 'false');
        ensureStyleItem(style, 'android:windowBackground', '@color/activityBackground');
      }
      if (name === 'Theme.App.SplashScreen') {
        ensureStyleItem(style, 'android:forceDarkAllowed', 'false');
        ensureStyleItem(style, 'android:windowBackground', '@color/splashscreen_background');
        ensureStyleItem(style, 'windowSplashScreenBackground', '@color/splashscreen_background');
        ensureStyleItem(style, 'android:windowSplashScreenBackground', '@color/splashscreen_background');
        ensureStyleItem(style, 'android:statusBarColor', '@color/splashscreen_background');
        ensureStyleItem(style, 'android:navigationBarColor', '@color/splashscreen_background');
        ensureStyleItem(style, 'android:windowLightStatusBar', 'false');
      }
    }
    return cfg;
  });

  config = withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app?.$) {
      app.$['android:forceDarkAllowed'] = 'false';
    }
    return cfg;
  });

  config = withMainApplication(config, (cfg) => {
    const isJava = cfg.modResults.language === 'java';
    let src = addImports(
      cfg.modResults.contents,
      ['androidx.appcompat.app.AppCompatDelegate'],
      isJava,
    );
    if (!src.includes('MODE_NIGHT_NO')) {
      const nightMode = isJava
        ? '    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);\n'
        : '    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)\n';
      src = src.replace(/override fun onCreate\(\) \{\n/, `override fun onCreate() {\n${nightMode}`);
      src = src.replace(
        /public void onCreate\(\) \{\n/,
        `public void onCreate() {\n${nightMode}`,
      );
    }
    cfg.modResults.contents = src;
    return cfg;
  });

  return config;
}

module.exports = withLightSplash;
