# COLOR SYSTEM
## Kisan Fashion Mall — Design Token Reference

Extracted from the provided HTML design files and adapted for both apps.

---

## Primary Palette

```css
/* Brand Colors */
--color-primary:        #1F7A4E;   /* Main green — buttons, accents, active states */
--color-primary-light:  #2D9E68;   /* Hover state, gradient end */
--color-primary-dark:   #165C3A;   /* Pressed state, dark variant */
--color-primary-bg:     #F0FBF5;   /* Light green background tint */

/* Kisan Logo Pink (from the actual logo) */
--color-brand-pink:     #E91E8C;   /* Hot pink — logo text "KISAN" */

/* Backgrounds */
--color-bg:             #FAF6EE;   /* Cream — main app background */
--color-surface:        #FFFFFF;   /* White — cards, inputs */
--color-surface-2:      #F9FAFB;   /* Off white — secondary surfaces */

/* Text */
--color-text:           #1A1A1A;   /* Near black — primary text */
--color-text-muted:     #6B7280;   /* Gray — secondary text, hints */
--color-text-light:     #9CA3AF;   /* Light gray — disabled, placeholders */

/* Borders */
--color-border:         #E5E7EB;   /* Light gray — card borders, dividers */
--color-border-focus:   #1F7A4E;   /* Green — input focus state */

/* Semantic Colors */
--color-success:        #10B981;   /* Green — completed, passed */
--color-warning:        #F59E0B;   /* Amber — coming soon, pending */
--color-error:          #EF4444;   /* Red — errors, failed */
--color-info:           #3B82F6;   /* Blue — info badges */

/* Coming Soon */
--color-coming-soon-bg: #FEF3C7;   /* Amber light — coming soon card bg */
--color-coming-soon:    #D97706;   /* Amber dark — coming soon text */
```

---

## Tailwind Config Extension

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#1F7A4E',
        light: '#2D9E68',
        dark: '#165C3A',
        bg: '#F0FBF5',
      },
      brand: {
        pink: '#E91E8C',
        cream: '#FAF6EE',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    fontFamily: {
      sans: ['Plus Jakarta Sans', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'sans-serif'],
    },
    borderRadius: {
      xl: '16px',
      '2xl': '20px',
      '3xl': '28px',
    },
  }
}
```

---

## Component Tokens

### Buttons
```
Primary Button:
  bg: #1F7A4E
  text: #FFFFFF
  hover bg: #2D9E68
  active bg: #165C3A
  border-radius: 12px
  height: 52px (mobile), 44px (desktop)
  font-weight: 600

Secondary Button (Outline):
  bg: transparent
  border: 2px solid #1F7A4E
  text: #1F7A4E
  hover bg: #F0FBF5

Danger Button:
  bg: #EF4444
  text: #FFFFFF
  hover bg: #DC2626

Disabled Button:
  bg: #E5E7EB
  text: #9CA3AF
  cursor: not-allowed
```

### Cards
```
Standard Card:
  bg: #FFFFFF
  border: 1px solid #E5E7EB
  border-radius: 16px
  padding: 20px
  shadow: 0 2px 8px rgba(0,0,0,0.06)

Hover Card:
  shadow: 0 4px 16px rgba(0,0,0,0.10)
  transition: 200ms

Active/Selected Card:
  border: 2px solid #1F7A4E
  bg: #F0FBF5
```

### Status Pills / Badges
```
Active / Success:
  bg: #D1FAE5
  text: #065F46
  
Draft / Pending:
  bg: #FEF3C7
  text: #92400E

Inactive / Error:
  bg: #FEE2E2
  text: #991B1B

Coming Soon:
  bg: #FEF3C7
  text: #D97706
  border: 1px solid #FCD34D

Info:
  bg: #DBEAFE
  text: #1E40AF
```

### Forms / Inputs
```
Input Field:
  bg: #FFFFFF
  border: 1px solid #E5E7EB
  border-radius: 10px
  padding: 12px 16px
  font-size: 16px
  color: #1A1A1A

Input Focus:
  border: 2px solid #1F7A4E
  box-shadow: 0 0 0 3px rgba(31, 122, 78, 0.1)

Input Error:
  border: 2px solid #EF4444
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)

Label:
  font-size: 14px
  font-weight: 500
  color: #374151
  margin-bottom: 6px
```

---

## Dark Mode Palette

### Employee App Dark Mode
```
--dm-bg:          #0F1A14;   /* Very dark green-black */
--dm-surface:     #1A2E22;   /* Dark surface */
--dm-card:        #1E3528;   /* Card background */
--dm-text:        #F0F4F2;   /* Light text */
--dm-text-muted:  #9CB8A8;   /* Muted text */
--dm-border:      #2D4A3A;   /* Dark border */
--dm-primary:     #2D9E68;   /* Brighter green for dark bg */
```

### Admin Dashboard Dark Mode
```
--dm-sidebar:     #111827;
--dm-bg:          #0F172A;
--dm-card:        #1E293B;
--dm-text:        #F1F5F9;
--dm-border:      #334155;
```

---

## Typography Scale

```
App Name / Hero:      28px, weight 700
Screen Heading:       22px, weight 600
Card Title:           18px, weight 600
Body Large:           16px, weight 400
Body:                 15px, weight 400
Body Small / Label:   14px, weight 400 or 500
Caption / Hint:       12px, weight 400
Micro / Badge:        11px, weight 500
```

---

## Spacing Scale

```
4px   — xs (icon gap, tight spacing)
8px   — sm (within components)
12px  — md-sm (between related items)
16px  — md (standard padding)
20px  — md-lg (card padding)
24px  — lg (section spacing)
32px  — xl (screen padding)
48px  — 2xl (between major sections)
```

---

## Logo Usage Guidelines

Until the actual PNG logo file is integrated in code:

```jsx
// Text logo component — use this everywhere
const KisanLogo = ({ size = 'md' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <span style={{
      fontSize: size === 'sm' ? 18 : size === 'lg' ? 32 : 24,
      fontWeight: 800,
      color: '#E91E8C',
      letterSpacing: '-0.02em',
      fontFamily: 'Plus Jakarta Sans'
    }}>
      KISAN
    </span>
    <span style={{
      fontSize: size === 'sm' ? 8 : size === 'lg' ? 12 : 10,
      fontWeight: 500,
      color: '#6B7280',
      letterSpacing: '0.2em',
    }}>
      FASHION MALL
    </span>
  </div>
)

// When actual logo PNG is ready, replace with:
// <img src="/logo.png" alt="Kisan Fashion Mall" height={size === 'sm' ? 32 : 48} />
```

Logo has a black background in the source file. When using on cream (#FAF6EE) or white backgrounds, use the text logo component above.
