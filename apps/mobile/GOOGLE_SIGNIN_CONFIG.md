# Google Sign-In & Build Configuration

This document explains the Google Sign-In setup and build profiles for the ZinuRooms mobile app.

## Overview

The app uses `@react-native-google-signin/google-signin` for authentication. Different configurations are used for development and production builds to allow both apps to coexist on the same device.

## Build Profiles

| Profile | Package Name | App Name | Use Case |
|---------|--------------|----------|----------|
| `development` | `com.zinurooms.app.dev` | ZinuRooms Dev | Local development, debugging |
| `production` | `com.zinurooms.app` | ZinuRooms | App Store release |

## How It Works

### Dynamic Configuration (`app.config.js`)

The `app.config.js` file reads the `APP_VARIANT` environment variable:
- `APP_VARIANT=development` → uses `.dev` suffix for package name
- `APP_VARIANT=production` (or not set) → uses production package name

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `APP_VARIANT` | Determines dev/production config (`development` or `production`) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | **Web Client ID** - used in `webClientId` config |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | **Android Client ID** - for reference only |

## Google Cloud Console Requirements

### For Each Android OAuth Client

Each Android OAuth client in Google Cloud Console needs:
1. **Package name** - must match the APK's package name exactly
2. **SHA-1 fingerprint** - must match the signing keystore

### Development Build

| Setting | Value |
|---------|-------|
| Client ID | `104361665388-2rjtt30pfvjatkkc8lnluq00fn2lloeh` |
| Package Name | `com.zinurooms.app.dev` |
| SHA-1 | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` |
| Keystore | `android/app/debug.keystore` |

### Production Build

| Setting | Value |
|---------|-------|
| Client ID | `104361665388-ls1do8ee0t8i9j53a25o46am3o66r4u3` |
| Package Name | `com.zinurooms.app` |
| SHA-1 | *(from `zinurooms-release.keystore`)* |
| Keystore | `android/app/zinurooms-release.keystore` |

### Web Client (Same for Both)

| Setting | Value |
|---------|-------|
| Client ID | `104361665388-erqs6259250hkjg13v378jshge11kaht` |
| Used For | `webClientId` in Google Sign-In config |

## Build Commands (Gradle)

### Development Build

```bash
# 1. Set development variant in .env
# APP_VARIANT=development (already set by default)

# 2. Prebuild native directories
npx expo prebuild --clean

# 3. Set SDK path (required after each prebuild)
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 4. Build debug APK
cd android && ./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Build

```bash
# 1. Change APP_VARIANT in .env to production
# APP_VARIANT=production

# 2. Prebuild native directories
npx expo prebuild --clean

# 3. Set SDK path (required after each prebuild)
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 4. Build release APK
cd android && ./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### Quick Reference

| Build Type | APP_VARIANT | Gradle Command | Output |
|------------|-------------|----------------|--------|
| Debug APK | `development` | `./gradlew assembleDebug` | `apk/debug/app-debug.apk` |
| Release APK | `production` | `./gradlew assembleRelease` | `apk/release/app-release.apk` |
| Release AAB | `production` | `./gradlew bundleRelease` | `bundle/release/app-release.aab` |

## Getting SHA-1 Fingerprints

### Debug Keystore
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android | grep SHA1
```

### Release Keystore
```bash
keytool -list -v -keystore android/app/zinurooms-release.keystore -alias <your-alias> | grep SHA1
```

## Troubleshooting

### DEVELOPER_ERROR

This error means Google Cloud Console is misconfigured. Check:
1. Package name matches exactly (including `.dev` suffix for dev builds)
2. SHA-1 fingerprint matches the keystore used to sign the APK
3. The correct OAuth client is being used

### SDK location not found

Run this after each `npx expo prebuild --clean`:
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Wrong package name | Verify `APP_VARIANT` is set correctly in `.env` |
| SHA-1 mismatch | Regenerate fingerprint and update Google Cloud Console |
| APK conflicts with production | Dev builds use `.dev` suffix, should install separately |
| SDK location not found | Run `echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties` |

## File Structure

```
apps/mobile/
├── app.config.js          # Dynamic Expo config (reads APP_VARIANT)
├── eas.json               # EAS config (optional, not used for Gradle builds)
├── .env                   # Local environment (APP_VARIANT=development)
├── .env.production        # Production reference
└── android/
    ├── local.properties           # SDK path (create after prebuild)
    └── app/
        ├── debug.keystore              # Debug signing (auto-generated)
        └── zinurooms-release.keystore  # Production signing
```

## Switching Between Dev and Production

### To switch to Production:
1. Edit `.env`: change `APP_VARIANT=development` to `APP_VARIANT=production`
2. Run `npx expo prebuild --clean`
3. Run `echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties`
4. Build with Gradle

### To switch back to Development:
1. Edit `.env`: change `APP_VARIANT=production` to `APP_VARIANT=development`
2. Run `npx expo prebuild --clean`
3. Run `echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties`
4. Build with Gradle

## Important Notes for AI Assistants

1. **Never mix client IDs** - Web Client ID goes in `webClientId`, Android Client is just for Google Cloud Console config
2. **Package names must match** - The OAuth Android client package must exactly match the APK package
3. **SHA-1 changes with keystore** - Different keystores = different SHA-1 = different OAuth clients needed
4. **Prebuild required** - Any changes to `app.config.js` or `APP_VARIANT` require `npx expo prebuild --clean`
5. **local.properties reset** - Prebuild removes `local.properties`, must recreate it each time
6. **Don't commit `.env`** - It contains environment-specific values
7. **All builds use Gradle** - User prefers `./gradlew assembleDebug` or `./gradlew assembleRelease`, not EAS
