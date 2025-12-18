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

## Commands

### Local Development
```bash
# Start dev server (uses APP_VARIANT=development from .env)
npx expo start

# Prebuild for local Android build
npx expo prebuild --clean

# Build debug APK locally
cd android && ./gradlew assembleDebug
```

### EAS Builds
```bash
# Development build (uses development profile)
eas build --profile development --platform android

# Production build
eas build --profile production --platform android

# Production APK (instead of AAB)
eas build --profile production-apk --platform android
```

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

### Common Issues

| Issue | Solution |
|-------|----------|
| Wrong package name | Verify `APP_VARIANT` is set correctly in `.env` |
| SHA-1 mismatch | Regenerate fingerprint and update Google Cloud Console |
| APK conflicts with production | Dev builds use `.dev` suffix, should install separately |

## File Structure

```
apps/mobile/
├── app.config.js          # Dynamic Expo config (reads APP_VARIANT)
├── eas.json               # EAS build profiles with env vars
├── .env                   # Local development environment
├── .env.production        # Production reference (not used in builds)
└── android/
    └── app/
        ├── debug.keystore              # Debug signing (auto-generated)
        └── zinurooms-release.keystore  # Production signing
```

## Important Notes for AI Assistants

1. **Never mix client IDs** - Web Client ID goes in `webClientId`, Android Client is just for Google Cloud Console config
2. **Package names must match** - The OAuth Android client package must exactly match the APK package
3. **SHA-1 changes with keystore** - Different keystores = different SHA-1 = different OAuth clients needed
4. **Prebuild required** - Any changes to `app.config.js` that affect native code require `npx expo prebuild --clean`
5. **Don't commit `.env`** - It contains environment-specific values
