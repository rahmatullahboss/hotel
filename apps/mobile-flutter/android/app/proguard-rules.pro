# Flutter specific ProGuard rules

# Keep Flutter classes
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep Stripe classes
-keep class com.stripe.** { *; }
-dontwarn com.stripe.**

# Keep Google Sign-In
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Keep Gson (used by many plugins)
-keep class com.google.gson.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

# Keep WebSocket
-keep class org.java_websocket.** { *; }
-dontwarn org.java_websocket.**

# General Android
-keep class androidx.** { *; }
-dontwarn androidx.**

# Prevent R8 from stripping interface info for generic types
-keepattributes InnerClasses
-keepattributes EnclosingMethod
