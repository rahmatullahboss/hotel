# Flutter Development Guide for React Native Developers

This guide explains the Flutter workflow, specifically tailored for someone coming from a React Native (Expo/CLI) background.

## 1. The Core Difference: How it Runs

| Feature         | React Native (Expo/CLI)                                       | Flutter                                                                                     |
| :-------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------ |
| **Rendering**   | Uses OEM Widgets (Native Button, Native Text) via a "Bridge". | **Skia/Impeller Engine**. Flutter draws every pixel itself. Consistent look across devices. |
| **Development** | **JavaScript Bundle** runs on a JS thread.                    | **Dart VM** (JIT - Just In Time). Code is compiled on the fly.                              |
| **Production**  | JS Bundle + Native Shell.                                     | **Native Binary** (AOT - Ahead Of Time). Compiles to machine code (ARM/x86).                |

### Why this fixes your text clipping?

In React Native, `Text` renders to a native `TextView` (Android) or `UILabel` (iOS). If the user changes their system font size, or if a specific Android model calculates line height differently, your layout breaks.
**Flutter** draws the text itself. It has full control over line height, font rendering, and layout. It looks identical on a Pixel, Samsung, and iPhone.

## 2. The Workflow: "Live Server" vs. `flutter run`

In React Native, you often start a Metro Bundler (Server) and then open the app.
In Flutter, the **CLI tool (`flutter`)** manages everything directly.

### Development (Debug Mode)

Command: `flutter run`

1.  **Builds an APK (Debug):** Uses Gradle to build a shell app that contains the Dart VM.
2.  **Installs & Syncs:** Installs the app on your emulator or connected device.
3.  **Hot Reload (⚡️):** When you save a file, `flutter` injects _only_ the new code files into the running Dart VM. State is preserved.
    - _Equivalent to RN Fast Refresh, but often robust._
    - Press `r` in the terminal or use the lightning bolt in VS Code/Android Studio.
4.  **Hot Restart:** Rebuilds the app state from scratch (like refreshing the page).
    - Press `R` (shift+r) in the terminal.

### Production (Release Mode)

Command: `flutter build apk --release`

1.  **AOT Compilation:** Dart code is compiled to native machine code. NOT a bundle.
2.  **Tree Shaking:** Unused code is removed.
3.  **Gradle Packaging:** Gradle wraps the native library (`.so` files) and assets into an `.apk` or `.aab`.
4.  **Performance:** No Dart VM overhead. Extremely fast startup and animation.

## 3. How to "See" the App

### Option A: Emulator (Easiest)

1.  Open Android Studio Device Manager or run `flutter emulators --launch <emulator_id>`.
2.  Run `flutter run`.

### Option B: Physical Device (USB)

1.  Enable "USB Debugging" on your Android phone.
2.  Connect via USB.
3.  Run `flutter run`.

### Option C: Physical Device (Wireless)

1.  Connect via USB first.
2.  Run `adb tcpip 5555`.
3.  Disconnect USB.
4.  Find phone IP (Settings > Wi-Fi).
5.  Run `adb connect <PHONE_IP>:5555`.
6.  Run `flutter run`.

## 4. Key Commands Cheat Sheet

| Action                | Command                                    |
| :-------------------- | :----------------------------------------- |
| **Start Dev Server**  | `flutter run`                              |
| **Hot Reload**        | Press `r` in terminal                      |
| **Hot Restart**       | Press `R` in terminal                      |
| **Check Issues**      | `flutter doctor`                           |
| **Clean Build Cache** | `flutter clean`                            |
| **Get Packages**      | `flutter pub get`                          |
| **Build APK**         | `flutter build apk --release`              |
| **Build App Bundle**  | `flutter build appbundle` (For Play Store) |

## 5. Gradle's Role

Yes, Gradle is still used!

- **React Native:** Gradle builds the native native modules and links the JS bundle.
- **Flutter:** Gradle builds the Android "host" app and links the Flutter Native Library.
- You rarely touch `build.gradle` unless you are adding native SDKs (like Firebase, Maps, Payment Gateways) or changing target SDK versions.
