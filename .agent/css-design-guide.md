# CSS Design Guide - Vibe Hospitality

এই ডকুমেন্টটি প্রজেক্টের সম্পূর্ণ CSS ডিজাইন সিস্টেম বর্ণনা করে। নতুন ফিচার তৈরির সময় এই গাইডলাইনগুলো অনুসরণ করুন।

---

## 📁 CSS ফাইল লোকেশন

```
apps/
├── web/app/globals.css      # Main User App CSS (5578 lines)
├── partner/app/globals.css  # Partner Dashboard CSS (1852 lines)
└── admin/app/globals.css    # Admin Dashboard CSS
```

---

## 🎨 Color System (CSS Variables)

### Web App (`apps/web/app/globals.css`)

```css
:root {
  /* Brand Colors */
  --color-primary: #E63946;        /* Zinu Red */
  --color-primary-hover: #D32F2F;
  --color-secondary: #0A192F;      /* Deep Navy */
  --color-secondary-hover: #112240;
  
  /* Gold Accent */
  --color-gold: #D4AF37;
  --color-gold-light: #F4E29E;
  --color-gold-dark: #AA8C2C;

  /* Status Colors */
  --color-success: #2A9D8F;        /* Green - Available/Confirmed */
  --color-warning: #E9C46A;        /* Yellow - Pending */
  --color-error: #EF476F;          /* Red - Error/Cancelled */

  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FAFAFA;
  --color-bg-dark: #0A192F;
  --color-bg-card: #FFFFFF;

  /* Text */
  --color-text-primary: #0A192F;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-text-light: #F8FAFC;

  /* Borders */
  --color-border: #E2E8F0;
  --color-border-dark: #1E293B;
}
```

### Partner App (`apps/partner/app/globals.css`)

```css
:root {
  --color-primary: #1D3557;        /* Deep Navy */
  --color-primary-hover: #152744;
  --color-accent: #E63946;         /* Zinu Red */
  --color-accent-hover: #d32f3b;

  /* Status Colors */
  --color-success: #2A9D8F;        /* Available */
  --color-warning: #E9C46A;        /* Pending */
  --color-error: #D00000;          /* Occupied/Blocked */

  /* Same background/text/border variables */
}
```

---

## 🌈 Gradients

```css
:root {
  --gradient-hero: linear-gradient(180deg, rgba(10, 25, 47, 0) 0%, #0A192F 100%);
  --gradient-primary: linear-gradient(135deg, #E63946 0%, #FF6B6B 100%);
  --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F4E29E 100%);
  --gradient-glass: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  --gradient-dark: linear-gradient(135deg, #0A192F 0%, #112240 100%);
}
```

---

## 🔘 Button Classes

| Class | Description | Usage |
|-------|-------------|-------|
| `.btn` | Base button | সব বাটনে ব্যবহার করুন |
| `.btn-primary` | Primary action (Red) | Main CTAs |
| `.btn-secondary` | Secondary (Navy) | Alternate actions |
| `.btn-accent` | Accent button | Partner app primary |
| `.btn-gold` | Gold gradient | Premium/VIP actions |
| `.btn-outline` | Bordered, transparent | Secondary actions |
| `.btn-success` | Green button | Confirm actions |
| `.btn-lg` | Large button | Hero sections |
| `.btn-block` | Full width | Mobile buttons |

### Button Example

```jsx
<button className="btn btn-primary">বুক করুন</button>
<button className="btn btn-outline">বাতিল</button>
<a href="#" className="btn btn-gold btn-lg">Premium Membership</a>
```

---

## 🃏 Card Classes

| Class | Description |
|-------|-------------|
| `.card` | Base card with shadow |
| `.card-image` | Card image (240px height) |
| `.card-body` | Card content padding |
| `.hotel-card` | Hotel listing card |
| `.room-card` | Room selection card |
| `.booking-card` | Booking summary card |

### Card Variants

```css
.booking-card-success   /* Green left border */
.booking-card-warning   /* Yellow left border */
.booking-card-primary   /* Primary left border */
```

---

## 📛 Badge Classes

| Class | Description |
|-------|-------------|
| `.badge` | Base badge |
| `.badge-success` | Green - Available/Confirmed |
| `.badge-warning` | Yellow - Pending |
| `.badge-error` | Red - Error/Cancelled |
| `.badge-pay-hotel` | "Pay at Hotel" badge |

### Badge Example

```jsx
<span className="badge badge-success">Confirmed</span>
<span className="badge-pay-hotel">Pay at Hotel</span>
```

---

## 📝 Form Classes

| Class | Description |
|-------|-------------|
| `.form-group` | Form field wrapper |
| `.form-label` | Input label |
| `.form-input` | Text input / textarea |
| `.form-hint` | Helper text |
| `.form-row` | Multi-column form layout |

### Form Example

```jsx
<div className="form-group">
  <label className="form-label">Hotel Name</label>
  <input type="text" className="form-input" />
  <span className="form-hint">Enter the official hotel name</span>
</div>
```

---

## 📐 Grid Systems

### Hotel Grid

```css
.hotel-grid {
  display: grid;
  gap: 1.5rem;
}

/* Mobile: 1 column */
/* Tablet (768px): 2 columns */
/* Desktop (1024px): 3 columns */
/* Large (1440px): 4 columns */
```

### Room Grid (Partner)

```css
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}
```

### Stats Grid

```css
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
```

---

## 📏 Responsive Breakpoints

| Breakpoint | Width | Description |
|-----------|-------|-------------|
| Mobile | `< 768px` | Default styles |
| Tablet | `≥ 768px` | `@media (min-width: 768px)` |
| Desktop | `≥ 1024px` | `@media (min-width: 1024px)` |
| Large Desktop | `≥ 1440px` | `@media (min-width: 1440px)` |

### Example

```css
/* Mobile first */
.hotel-grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .hotel-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .hotel-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🧭 Navigation Classes

### Bottom Navigation (Mobile)

```css
.bottom-nav      /* Fixed bottom navigation */
.nav-item        /* Navigation link */
.nav-item.active /* Active state */
```

### Top Navigation (Desktop)

```css
.top-nav         /* Sticky top navigation */
.top-nav-logo    /* Brand logo */
.top-nav-links   /* Navigation links container */
.top-nav-link    /* Single nav link */
.top-nav-actions /* Right side actions */
```

---

## 🎯 Special Components

### Search Form

```css
.search-form          /* Container */
.search-form-compact  /* Compact version */
.search-row           /* Form row */
.search-field         /* Input field */
.search-field-icon    /* Field icon */
.search-field-label   /* Field label */
.search-field-input   /* Text input */
.search-btn           /* Search button */
```

### Hotel Switcher (Partner)

```css
.hotel-switcher      /* Container */
.hotel-switcher-btn  /* Trigger button */
.hotel-switcher-dropdown /* Dropdown menu */
.hotel-switcher-item /* Hotel list item */
```

### Onboarding Wizard (Partner)

```css
.onboarding-wizard   /* 2-column layout */
.wizard-progress     /* Left sidebar stepper */
.wizard-content      /* Right content area */
.wizard-navigation   /* Bottom buttons */
.progress-step       /* Single step */
.step-indicator      /* Step number/icon */
```

---

## 🔀 Utility Classes

| Class | Description |
|-------|-------------|
| `.container` | Max-width 1200px, centered |
| `.container-sm` | Max-width 600px |
| `.text-success` | Green text |
| `.text-warning` | Yellow text |
| `.text-error` | Red text |
| `.text-muted` | Muted gray text |
| `.hide-on-desktop` | Hide on lg screens |

---

## ✨ Animation Keyframes

```css
@keyframes fadeInUp      /* Fade in from below */
@keyframes fadeIn        /* Simple fade */
@keyframes slideInLeft   /* Slide from left */
@keyframes shimmer       /* Loading shimmer */
@keyframes float         /* Floating effect */
@keyframes pulseGlow     /* Glowing pulse */
@keyframes gradientShift /* Gradient animation */
@keyframes scaleIn       /* Scale entrance */
```

### Usage

```css
.element {
  animation: fadeInUp 0.5s ease-out;
}
```

---

## 🎭 Shadow Variables

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-glow: 0 0 20px rgba(230, 57, 70, 0.4);
--shadow-gold: 0 10px 30px rgba(212, 175, 55, 0.2);
```

---

## 🔤 Typography

### Fonts

```css
/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.02em;
}

/* Body */
body {
  font-family: 'Inter', sans-serif;
}

/* Variable Font */
--font-geist-sans /* System font fallback */
```

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
```

---

## ⚠️ Important Rules

1. **No Inline Styles** - Always use classes from globals.css or Tailwind
2. **Mobile First** - Write mobile styles first, then add media queries
3. **Use CSS Variables** - Never hardcode colors, use `var(--color-xxx)`
4. **BEM-like Naming** - Follow existing patterns like `.hotel-card-image`
5. **Tailwind + Custom** - Both can be used together

---

## 📋 Quick Reference Cheatsheet

```jsx
// Button
<button className="btn btn-primary">Action</button>

// Card
<div className="card">
  <img className="card-image" />
  <div className="card-body">Content</div>
</div>

// Badge
<span className="badge badge-success">Status</span>

// Form
<div className="form-group">
  <label className="form-label">Label</label>
  <input className="form-input" />
</div>

// Grid
<div className="hotel-grid">
  {hotels.map(h => <HotelCard />)}
</div>
```

---

**Last Updated:** 2025-12-21
