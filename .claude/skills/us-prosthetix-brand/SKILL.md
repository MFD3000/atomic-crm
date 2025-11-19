---
name: us-prosthetix-brand
description: Apply US Prosthetix brand identity and "High-Tech Humanism" aesthetic when building CRM features. Use when working on UI components, pages, or styling for the US Prosthetix CRM transformation. Ensures brand consistency across franchisee tracking, patient data, and 51 Oakwood prospects.
---

# US Prosthetix Brand Style Guide

This skill ensures all frontend work aligns with the US Prosthetix brand identity: **High-Tech Humanism** - a blend of medical industrial precision, bionic technology, and patient-focused care.

## Business Context

US Prosthetix offers turnkey franchise opportunities for orthotics and prosthetics clinics, operates their own clinic, and runs 51 Oakwood medical billing company. The CRM needs to track:

1. **Franchisee CRM Data** - Franchise prospects and partners
2. **Patient CRM Data** - US Prosthetix clinic patients
3. **Private Practice Doctor CRM Data** - 51 Oakwood billing prospects

**Brand Keywords:** Medical industrial, bionic precision, clean, authoritative, patient-focused.

---

## Color System

Our palette blends clinical cleanliness with technical precision. Always use these exact values.

### Primary Colors

```css
/* Tailwind Classes & Hex Values */
--void-slate: #0f172a;      /* slate-900 - Primary backgrounds, text */
--clinical-white: #ffffff;  /* white - Main content, cards */
--grid-gray: #f8fafc;       /* slate-50 - Subtle backgrounds, lists */
```

**Usage Guidelines:**
- **Void Slate** (`bg-slate-900`, `text-slate-900`): Hero sections, footer, primary text on white backgrounds
- **Clinical White** (`bg-white`): Main content areas, cards on dark backgrounds
- **Grid Gray** (`bg-slate-50`): Alternating rows, timeline backgrounds, subtle section dividers

### Accent Colors

```css
/* Tailwind Classes & Hex Values */
--bionic-blue: #2563eb;     /* blue-600 - Primary actions */
--life-emerald: #10b981;    /* emerald-500 - Success, orthotics */
--alert-red: #ef4444;       /* red-500 - Errors, urgent */
```

**Usage Guidelines:**
- **Bionic Blue** (`bg-blue-600`, `text-blue-600`, `border-blue-600`): Primary buttons, active states, links, key highlights, focus states
- **Life Emerald** (`bg-emerald-500`, `text-emerald-500`): Success messages, "Orthotics" branding, health indicators, completed tasks
- **Alert Red** (`bg-red-500`, `text-red-500`): Error states, urgent notices, deletion warnings

### Supporting Colors

```css
/* Additional Slate shades for depth */
--slate-100: #f1f5f9;  /* Hover states on white */
--slate-200: #e2e8f0;  /* Borders, dividers */
--slate-300: #cbd5e1;  /* Disabled states */
--slate-600: #475569;  /* Secondary text */
--slate-800: #1e293b;  /* Darker backgrounds */
```

---

## Typography System

We pair industrial authority (Oswald) with modern clarity (Geist Sans/Inter).

### Headings - Oswald

**Font:** [Oswald](https://fonts.google.com/specimen/Oswald)

```tsx
// Import in layout or global CSS
import { Oswald } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
});
```

**Characteristics:**
- Condensed, bold, industrial, authoritative
- Use for ALL headings (`h1`, `h2`, `h3`, `h4`)
- Often UPPERCASE for `h1`/`h2` for maximum impact
- Letter-spacing: `0.02em` (tracking-wide)

**Tailwind Classes:**
```tsx
<h1 className="font-oswald uppercase text-4xl tracking-wide font-bold">
  Franchisee Dashboard
</h1>

<h2 className="font-oswald uppercase text-2xl tracking-wide font-semibold text-slate-900">
  Patient Records
</h2>
```

**Fallback:** Impact, Arial Narrow, sans-serif

### Body Copy - Geist Sans / Inter

**Font:** [Geist Sans](https://vercel.com/font) (primary) or [Inter](https://fonts.google.com/specimen/Inter) (fallback)

```tsx
// Using Geist Sans
import { GeistSans } from 'geist/font/sans';

// Or using Inter
import { Inter } from 'next/font/google';
```

**Characteristics:**
- Clean, neutral, high readability
- Use for paragraphs, lists, UI text, buttons, table data

**Tailwind Classes:**
```tsx
<p className="font-sans text-base text-slate-600 leading-relaxed">
  Track franchise performance metrics...
</p>

<button className="font-sans text-sm font-medium">
  Add Patient
</button>
```

**Fallback:** Helvetica, Arial, sans-serif

---

## Visual Elements & Textures

### Technical Grid Pattern

Emphasize CAD/3D printing capabilities with subtle grid overlays on dark sections.

```tsx
// Background pattern utility
<div className="relative bg-slate-900">
  {/* Grid overlay */}
  <div
    className="absolute inset-0 opacity-5"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }}
  />

  {/* Content */}
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

**Pattern Specs:**
- Grid size: 40px x 40px
- Opacity: 3-5% (barely visible)
- Use on: Dashboard headers, hero sections, dark cards

### Noise Texture

Add tactile depth to dark sections with film grain overlay.

```tsx
// Add to dark backgrounds for texture
<div
  className="bg-slate-900 relative"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
  }}
>
  {/* Content */}
</div>
```

**Specs:**
- Blend mode: Overlay
- Opacity: 3-5%
- Use on: Large dark sections (hero, footer, modals)

### Iconography - Lucide React

**Library:** Already available in Atomic CRM via `lucide-react`

```tsx
import { User, FileText, TrendingUp, Activity } from 'lucide-react';

// Icon with brand styling
<div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
  <Activity className="w-6 h-6 text-white" strokeWidth={2} />
</div>
```

**Style Guidelines:**
- Stroke width: 2px (matches Oswald weight)
- Frame in rounded squares (`rounded-lg`) or circles (`rounded-full`)
- Primary color: Bionic Blue or Life Emerald
- Size: 24px (w-6 h-6) for standard, 32px (w-8 h-8) for featured

---

## UI Component Guidelines

### Buttons

**Primary - Bionic Blue**
```tsx
<button className="
  bg-blue-600 hover:bg-blue-700
  text-white font-sans font-medium
  px-6 py-2.5 rounded-md
  transition-colors duration-200
  shadow-sm hover:shadow-md
">
  Add Franchisee
</button>
```

**Secondary - Outline**
```tsx
<button className="
  border-2 border-slate-200 hover:bg-slate-50
  text-slate-900 font-sans font-medium
  px-6 py-2.5 rounded-md
  transition-colors duration-200
">
  Cancel
</button>
```

**Success - Life Emerald**
```tsx
<button className="
  bg-emerald-500 hover:bg-emerald-600
  text-white font-sans font-medium
  px-6 py-2.5 rounded-md
  transition-colors duration-200
">
  Complete Assessment
</button>
```

**Destructive - Alert Red**
```tsx
<button className="
  bg-red-500 hover:bg-red-600
  text-white font-sans font-medium
  px-6 py-2.5 rounded-md
  transition-colors duration-200
">
  Delete Patient
</button>
```

**Note:** For marketing materials, use skewed buttons (`-skew-x-6`) for forward motion. For CRM/app, keep standard `rounded-md`.

### Cards

**Utility Cards (CRM Default)**
```tsx
<div className="
  bg-white
  border border-slate-200
  rounded-lg shadow-sm
  p-6
  hover:shadow-md transition-shadow duration-200
">
  {/* Card content */}
</div>
```

**Dark Cards (Featured Sections)**
```tsx
<div className="
  bg-slate-900
  rounded-lg shadow-lg
  p-8
  relative overflow-hidden
">
  {/* Optional: Add grid pattern */}
  <div className="absolute inset-0 opacity-5" style={{...gridPattern}} />

  <div className="relative z-10 text-white">
    {/* Card content */}
  </div>
</div>
```

**Accent Cards (Metrics/Stats)**
```tsx
<div className="
  bg-gradient-to-br from-blue-600 to-blue-700
  rounded-lg shadow-md
  p-6 text-white
">
  {/* Stat card content */}
</div>
```

### Form Inputs

**Text Input**
```tsx
<input
  type="text"
  className="
    w-full bg-white
    border border-slate-200
    rounded-md px-4 py-2.5
    font-sans text-base text-slate-900
    placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-shadow duration-200
  "
  placeholder="Franchisee Name"
/>
```

**Select Dropdown**
```tsx
<select className="
  w-full bg-white
  border border-slate-200
  rounded-md px-4 py-2.5
  font-sans text-base text-slate-900
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
">
  <option>Select Clinic Location</option>
</select>
```

### Data Tables

**Table Structure**
```tsx
<div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
  <table className="w-full">
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>
        <th className="px-6 py-3 text-left font-oswald uppercase text-sm tracking-wide text-slate-900">
          Patient Name
        </th>
        <th className="px-6 py-3 text-left font-oswald uppercase text-sm tracking-wide text-slate-900">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200">
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 font-sans text-sm text-slate-900">
          John Doe
        </td>
        <td className="px-6 py-4">
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            Active
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Status Badges

```tsx
// Success / Active
<span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
  Active
</span>

// Warning / Pending
<span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
  Pending
</span>

// Error / Inactive
<span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
  Inactive
</span>

// Info / In Progress
<span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
  In Progress
</span>
```

---

## Layout Patterns

### Page Header

```tsx
<header className="bg-slate-900 border-b border-slate-800">
  <div className="max-w-7xl mx-auto px-6 py-8">
    <h1 className="font-oswald uppercase text-4xl tracking-wide font-bold text-white mb-2">
      Franchisee Dashboard
    </h1>
    <p className="font-sans text-slate-300 text-lg">
      Track performance across all clinic locations
    </p>
  </div>
</header>
```

### Section Container

```tsx
<section className="py-12 bg-grid-gray">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="font-oswald uppercase text-2xl tracking-wide font-semibold text-slate-900 mb-6">
      Recent Patients
    </h2>
    {/* Section content */}
  </div>
</section>
```

### Dashboard Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Metric cards */}
  <div className="bg-white border border-slate-200 rounded-lg p-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
        <Users className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
      <div>
        <p className="font-sans text-sm text-slate-600">Total Franchisees</p>
        <p className="font-oswald text-3xl font-bold text-slate-900">142</p>
      </div>
    </div>
  </div>
</div>
```

---

## Business-Specific Components

### Franchisee Status Indicator

```tsx
type FranchiseeStatus = 'active' | 'pending' | 'inactive';

const statusConfig: Record<FranchiseeStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  inactive: { label: 'Inactive', color: 'text-red-700', bg: 'bg-red-100' },
};

<span className={`px-2.5 py-1 ${statusConfig[status].bg} ${statusConfig[status].color} rounded-full text-xs font-medium`}>
  {statusConfig[status].label}
</span>
```

### Patient Type Badge

```tsx
// Orthotics = Life Emerald
<span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
  Orthotics
</span>

// Prosthetics = Bionic Blue
<span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
  Prosthetics
</span>
```

### 51 Oakwood Branding

When displaying 51 Oakwood billing features:
```tsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center">
    <span className="font-oswald text-white text-sm font-bold">51</span>
  </div>
  <span className="font-oswald uppercase tracking-wide text-slate-900">
    Oakwood Billing
  </span>
</div>
```

---

## Atomic CRM Integration

### Updating Existing Components

When modifying Atomic CRM components:

1. **Replace Shadcn default colors** with US Prosthetix palette
2. **Apply Oswald** to all headings via Tailwind config
3. **Use Geist Sans/Inter** for body copy
4. **Add grid patterns** to dashboard headers
5. **Update button styles** to match brand
6. **Modify card shadows** to be more subtle (shadow-sm default)

### Tailwind Config Updates

Add to `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'void-slate': '#0f172a',
        'clinical-white': '#ffffff',
        'grid-gray': '#f8fafc',
        'bionic-blue': '#2563eb',
        'life-emerald': '#10b981',
        'alert-red': '#ef4444',
      },
      fontFamily: {
        oswald: ['Oswald', 'Impact', 'Arial Narrow', 'sans-serif'],
        sans: ['Geist Sans', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
};
```

### Theme Provider Updates

Update `src/components/atomic-crm/root/CRM.tsx` to pass custom logos and title:

```tsx
<CRM
  title="US Prosthetix CRM"
  lightModeLogo="/logo-light.svg"
  darkModeLogo="/logo-dark.svg"
  // ... other props
/>
```

---

## Best Practices

1. **Always use brand colors** - Never deviate from the defined palette
2. **Oswald for headings** - ALL headings, often uppercase
3. **2px stroke icons** - Matches Oswald weight
4. **Subtle textures on dark** - Grid + noise at 3-5% opacity
5. **Blue for primary actions** - Emerald for success/health
6. **Clean white cards** - Subtle borders and shadows
7. **Test accessibility** - Ensure color contrast meets WCAG AA
8. **Mobile responsive** - Use `useIsMobile()` hook from Atomic CRM
9. **Consistent spacing** - Use Tailwind spacing scale (4, 6, 8, 12, 16, 24)
10. **Professional medical tone** - Clean, precise, trustworthy

---

## Quick Reference

**Primary Actions:** `bg-blue-600` (Bionic Blue)
**Success States:** `bg-emerald-500` (Life Emerald)
**Error States:** `bg-red-500` (Alert Red)
**Dark Backgrounds:** `bg-slate-900` (Void Slate)
**Light Backgrounds:** `bg-white` or `bg-slate-50` (Grid Gray)
**Headings:** `font-oswald uppercase tracking-wide`
**Body Text:** `font-sans text-slate-600`
**Card Style:** `bg-white border border-slate-200 rounded-lg shadow-sm`
**Button Style:** `bg-blue-600 hover:bg-blue-700 text-white rounded-md`

Remember: **High-Tech Humanism** = Medical precision meets patient care. Keep it clean, authoritative, and human.
