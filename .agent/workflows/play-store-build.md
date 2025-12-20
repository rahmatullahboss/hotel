---
description: Build Android app for Play Store submission
---

# Play Store Build Workflow

This workflow builds and signs the Android App Bundle (AAB) for Google Play Store submission.

## Prerequisites

- Android SDK installed (`~/Library/Android/sdk`)
- Java (Android Studio JBR)
- Release keystore (`~/Desktop/zinurooms-release.keystore`)

## Steps

### 1. Increment Version Code

Before each Play Store upload, increment `versionCode` in `apps/mobile/android/app/build.gradle`:

```groovy
// Find this section in defaultConfig:
versionCode 3  // Increment this each time (2 → 3 → 4 → 5...)
versionName "1.0.2"  // Update version name as needed
```

**Important:** Play Store rejects uploads with same or lower versionCode.

### 2. Run Production Prebuild

```bash
cd apps/mobile
APP_VARIANT=production npx expo prebuild --platform android --clean
```

### 3. Add SDK Path

Create/update `android/local.properties`:

```properties
sdk.dir=/Users/rahmatullahzisan/Library/Android/sdk
```

### 4. Copy Keystore

```bash
cp ~/Desktop/zinurooms-release.keystore android/app/
```

### 5. Configure Signing (if reset by prebuild)

Add release signing config to `android/app/build.gradle`:

```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        storeFile file('zinurooms-release.keystore')
        storePassword 'ZinuRooms2024'
        keyAlias 'zinurooms'
        keyPassword 'ZinuRooms2024'
    }
}
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release
        // ... rest of release config
    }
}
```

### 6. Build Release AAB
// turbo
```bash
cd apps/mobile
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android && ./gradlew bundleRelease
```

### 7. Verify and Locate AAB

```bash
ls -lh android/app/build/outputs/bundle/release/app-release.aab
open -R android/app/build/outputs/bundle/release/app-release.aab
```

## Output

- **AAB Location:** `apps/mobile/android/app/build/outputs/bundle/release/app-release.aab`
- **Size:** ~71MB
- **Signed with:** ZinuRooms release keystore

## Keystore Details

| Field | Value |
|-------|-------|
| **File** | `zinurooms-release.keystore` |
| **Alias** | `zinurooms` |
| **Password** | `ZinuRooms2024` |
| **SHA-1** | `D5:23:2C:EF:8C:A8:17:E6:22:BD:A4:9C:B9:7D:08:5A:08:5A:5F:4C` |

## Google Sign-In Setup

Add the SHA-1 fingerprint to Google Cloud Console → Android OAuth client for production package `com.zinurooms.app`.
