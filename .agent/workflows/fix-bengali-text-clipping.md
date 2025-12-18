---
description: Fix Bengali/multi-language text clipping in React Native
---

# Fixing Text Clipping Issues (Bengali/Multi-language)

Bengali and other non-Latin scripts often render wider than English text, causing clipping in fixed-width containers.

## Diagnosis Steps

1. **Identify the issue**: Text appears cut off or truncated
2. **Check translations**: Verify the full text exists in the translation file (`i18n/locales/bn.json`)
3. **Inspect container**: The issue is usually container width, not missing text

## Solutions (Try in Order)

### 1. Reduce Font Size
The simplest fix - make text smaller to fit:

```tsx
// Before (clipped)
<Text className="text-xs">...</Text>

// After (fits)
<Text className="text-[10px]">...</Text>
```

### 2. Add Full Width
Ensure text uses all available space:

```tsx
<Text className="text-xs w-full text-center">
  {label}
</Text>
```

### 3. Add Line Height (Vertical Clipping)
For Bengali scripts that extend above/below baseline:

```tsx
<Text style={{ lineHeight: 16 }}>
  {label}
</Text>
```

### 4. Allow Text Wrapping
If space allows, let text wrap to 2 lines:

```tsx
<Text numberOfLines={2}>
  {label}
</Text>
```

### 5. Auto-Scale Font (iOS only - may not work on Android)
```tsx
<Text 
  adjustsFontSizeToFit
  minimumFontScale={0.8}
  numberOfLines={1}
>
  {label}
</Text>
```

### 6. Expand Container
Add padding/width to parent container:

```tsx
// Parent with more space
<View className="flex-row px-2">
  <TouchableOpacity className="flex-1 px-1">
    ...
  </TouchableOpacity>
</View>
```

## Common Problem Areas

| Component | Typical Fix |
|-----------|-------------|
| Stats cards (3 columns) | Smaller font (10px) |
| Button labels | `w-full` or reduce padding |
| Tab bars | Smaller font or icon-only |
| Filter chips | Allow 2 lines or ellipsis |

## Prevention Tips

1. **Test with Bengali** during development, not just English
2. **Use flexible layouts** (`flex-1`) instead of fixed widths
3. **Keep labels short** in translations when possible
4. **Consider icon-only** for very limited space
