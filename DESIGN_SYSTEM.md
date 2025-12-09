# rhythmDerby Design System
## Light-Mode Industrial Sci-Fi UI

---

## Overview

This design system implements a light-mode UI inspired by **Arknights: Endfield**, blending industrial sci-fi, nu-brutalism, and minimal futuristic anime aesthetics. The system prioritizes high readability on bright surfaces while maintaining a technical, instruction-manual feel.

---

## Design Principles

### 1. Industrial Sci-Fi + Instruction Manual
- **Functional layouts** with clear grids and rectangular panels
- **Technical labels** and coordinate markers throughout
- **Spec-sheet styling** for data presentation
- **Thin separators** on off-white/light-gray backgrounds

### 2. Nu-Brutalist UI
- **Flat colors** with minimal gradients
- **Strong color blocks** for panels and key elements
- **Square/slightly rounded rectangles** (rounded corners only for primary CTAs)
- **High contrast** between dark typography and light backgrounds
- **Bold accent colors** for hierarchy and interaction

### 3. Typography
- **Display Font**: Space Grotesk (headings, uppercase)
- **Body Font**: Inter (UI text, labels)
- **Mono Font**: JetBrains Mono (technical data, stats)

---

## Color Palette

### Base Colors

```css
/* Backgrounds */
--bg-primary: #FAFBFC      /* Main app background */
--bg-secondary: #F0F2F5    /* Secondary surfaces */
--bg-tertiary: #E8EAED     /* Darker elements */
--bg-surface: #FFFFFF      /* Cards, modals */

/* Text */
--text-primary: #1A1D23    /* Primary text */
--text-secondary: #3D4451  /* Secondary labels */
--text-tertiary: #6B7280   /* Tertiary/muted */
--text-disabled: #9CA3AF   /* Disabled states */

/* Borders */
--border-primary: #D1D5DB  /* Standard dividers */
--border-secondary: #9CA3AF /* Emphasized borders */
--border-subtle: #E5E7EB   /* Very light separators */
```

### Accent Colors

```css
/* Primary Accent - Cyan/Teal */
--accent-primary: #00D4D4
--accent-primary-dark: #00A8A8
--accent-primary-light: #33E0E0

/* Secondary Accent - Orange */
--accent-secondary: #FF6B35
--accent-secondary-dark: #E55A2B
--accent-secondary-light: #FF8A5C

/* Semantic Colors */
--accent-success: #10B981  /* Green */
--accent-warning: #F59E0B  /* Amber */
--accent-danger: #EF4444   /* Red */
--accent-info: #3B82F6     /* Blue */
```

### Usage Guidelines

| Color | Primary Use | Examples |
|-------|-------------|----------|
| **Cyan (#00D4D4)** | Selected states, primary CTAs, active elements | Selected song cards, primary buttons, progress bars |
| **Orange (#FF6B35)** | Warnings, secondary actions, highlights | Warning messages, secondary buttons, skill meters |
| **Green (#10B981)** | Success states, perfect hits | Success messages, HP bars, perfect judgments |
| **Amber (#F59E0B)** | Warnings, energy indicators | Warning states, energy bars |
| **Red (#EF4444)** | Errors, danger, missed notes | Error messages, danger buttons, miss judgments |

---

## Typography Scale

### Headings

```css
h1 { 
  font-size: 2.5rem;      /* 40px */
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h2 { 
  font-size: 2rem;        /* 32px */
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h3 { 
  font-size: 1.5rem;      /* 24px */
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

h4 { 
  font-size: 1.25rem;     /* 20px */
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
```

### Body Text

```css
/* Large Body */
font-size: 1rem;          /* 16px */
font-weight: 500;

/* Standard Body */
font-size: 0.875rem;      /* 14px */
font-weight: 400;

/* Caption/Labels */
font-size: 0.75rem;       /* 12px */
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.05em;

/* Technical/Mono */
font-family: 'JetBrains Mono';
font-size: 0.875rem;      /* 14px */
font-weight: 500;
```

---

## Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.5rem;    /* 24px */
--space-6: 2rem;      /* 32px */
--space-8: 3rem;      /* 48px */
--space-10: 4rem;     /* 64px */
```

**Usage:**
- Component padding: `--space-4` (16px)
- Section gaps: `--space-6` (32px)
- Page margins: `--space-6` to `--space-8`

---

## Border Radius

```css
--radius-none: 0;
--radius-sm: 4px;      /* Buttons, inputs, sharp elements */
--radius-md: 8px;      /* Cards, panels */
--radius-lg: 12px;     /* Modals, large containers */
--radius-xl: 16px;     /* Special large elements */
--radius-full: 9999px; /* Pills, circular elements */
```

---

## Shadows

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.12);
--shadow-accent: 0 4px 6px rgba(0, 212, 212, 0.15);
```

**Usage:**
- Default cards: `--shadow-sm`
- Hover states: `--shadow-md`
- Modals: `--shadow-xl`
- Selected/accent elements: `--shadow-accent`

---

## Components

### Buttons

#### Variants

**Primary Button**
```tsx
<Button variant="primary">START GAME</Button>
```
- Solid cyan fill (#00D4D4)
- White text
- 2px border
- Hover: Darker cyan + shadow + slight lift

**Secondary Button**
```tsx
<Button variant="secondary">SETTINGS</Button>
```
- Transparent background
- Dark text with gray border
- Hover: Cyan border + light cyan tint

**Danger Button**
```tsx
<Button variant="danger">DELETE</Button>
```
- Solid red fill (#EF4444)
- White text
- Hover: Darker red + shadow

**Ghost Button**
```tsx
<Button variant="ghost">Cancel</Button>
```
- Transparent background
- Secondary text color
- Hover: Light gray background

#### Sizes
- `sm`: 32px height, 16px horizontal padding
- `md`: 40px height, 24px horizontal padding (default)
- `lg`: 48px height, 32px horizontal padding

### Cards

```tsx
<Card selected={isSelected} hover onClick={handleClick}>
  {/* Content */}
</Card>
```

**States:**
- **Default**: White background, thin gray border, subtle shadow
- **Hover**: Slightly darker border, increased shadow
- **Selected**: Cyan border (2px), cyan left accent bar (4px), accent shadow

### Badges

```tsx
<Badge variant="accent">ACTIVE</Badge>
<Badge variant="success">PERFECT</Badge>
<Badge variant="warning">WARNING</Badge>
```

**Variants:**
- `default`: Gray background, dark text
- `accent`: Light cyan background, cyan text
- `success`: Light green background, green text
- `warning`: Light amber background, amber text
- `danger`: Light red background, red text

### Progress Bars

```tsx
<ProgressBar 
  value={80} 
  max={100} 
  color="var(--accent-primary)"
  label="COMBO"
  showValue
/>
```

- Height: 8px (0.5rem)
- Background: Light gray
- Fill: Accent color with smooth transition
- Optional label and value display

### Stat Bars

```tsx
<StatBar 
  label="Accuracy" 
  value={85} 
  color="var(--accent-primary)"
/>
```

- Label (left): Monospace, uppercase, gray
- Track (center): Light gray background, colored fill
- Value (right): Monospace, bold, dark

### Tabs

```tsx
<Tabs 
  tabs={[
    { id: 'audio', label: 'Audio', icon: <Volume2 /> },
    { id: 'video', label: 'Video', icon: <Monitor /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  {/* Tab content */}
</Tabs>
```

**Active State:**
- Cyan text color
- 3px cyan underline
- Smooth slide animation

### Modals

```tsx
<Modal 
  isOpen={isOpen} 
  onClose={handleClose}
  title="SETTINGS"
  size="lg"
>
  {/* Modal content */}
</Modal>
```

**Features:**
- Backdrop blur
- Centered positioning
- White panel with border
- Smooth scale + fade animation
- ESC key to close

---

## Game-Specific Components

### Song Card

```tsx
<SongCard 
  song={songData} 
  selected={isSelected}
  onClick={handleSelect}
/>
```

**Layout:**
- Album art thumbnail (left)
- Song title + artist (center)
- BPM + difficulty stars (right)
- Genre badges (bottom)

### Character Card

```tsx
<CharacterCard 
  character={characterData}
  selected={isSelected}
  onClick={handleSelect}
  compact={false}
/>
```

**Layouts:**
- **Compact**: Small avatar, name, level badge
- **Full**: Large avatar, stats grid, abilities list

### HUD Widget

```tsx
<HUDWidget 
  label="SCORE"
  value="12,450"
  icon={<Trophy />}
/>
```

**Styling:**
- Light translucent background
- Thin border
- Backdrop blur
- Monospace value display

### Combo Display

```tsx
<ComboDisplay 
  combo={125}
  maxCombo={999}
/>
```

**Features:**
- Large animated number
- Progress bar showing combo progress
- Scale animation on combo increase

---

## Layout Patterns

### Main Menu

```
┌──────────────────────────────────────┐
│ LOGO              [PROFILE] [COINS]  │
├──────────────────────────────────────┤
│                                      │
│    ┌──────────────────────┐          │
│    │  ▶ START GAME        │          │
│    │  SONG SELECT         │          │
│    │  CHARACTERS          │          │
│    │  SETTINGS            │          │
│    └──────────────────────┘          │
│                                      │
│  [DAILY]  [EVENTS]  [NEWS]           │
│                                      │
│  VER 1.0.0              #SYS-001     │
└──────────────────────────────────────┘
```

### Song Selection

```
┌──────────────────────────────────────┐
│ SONG SELECTION    [FILTER] [SORT]    │
├──────────────────────────────────────┤
│ ┌────────┐ │ ┌──────────────────┐   │
│ │ Song 1 │ │ │ SONG DETAILS     │   │
│ ├────────┤ │ │                  │   │
│ │ Song 2 │ │ │ [Album Art]      │   │
│ ├────────┤ │ │                  │   │
│ │ Song 3 │ │ │ Difficulty       │   │
│ │        │ │ │ Stats            │   │
│ │        │ │ │                  │   │
│ │        │ │ │ [PLAY] [PREVIEW] │   │
│ └────────┘ │ └──────────────────┘   │
└──────────────────────────────────────┘
```

### In-Game HUD

```
┌──────────────────────────────────────┐
│ COMBO: 125x           SCORE: 12,450  │
│ ████████░░                            │
│                                      │
│         [GAMEPLAY AREA]              │
│                                      │
│ HP: ████████░ 80%    TIME: 01:45     │
└──────────────────────────────────────┘
```

---

## Animation Guidelines

### Timing

```css
--transition-fast: 150ms ease;   /* Hover effects */
--transition-base: 200ms ease;   /* Standard transitions */
--transition-slow: 300ms ease;   /* Panel slides */
```

### Common Animations

**Fade In**
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide In Up**
```css
@keyframes slide-in-up {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Scale on Hover**
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

---

## Accessibility

### Contrast Ratios
- **Primary text on light backgrounds**: 12.5:1 (AAA)
- **Secondary text on light backgrounds**: 7.5:1 (AAA)
- **Accent colors on white**: Minimum 4.5:1 (AA)

### Focus States
- All interactive elements have visible focus indicators
- Cyan outline (2px) with light cyan glow

### Keyboard Navigation
- Full keyboard support for all components
- Tab order follows visual hierarchy
- ESC key closes modals and dropdowns

### Screen Readers
- Proper ARIA labels on all interactive elements
- Semantic HTML structure
- Alt text for all images and icons

---

## Technical Labels

### Coordinate Markers

```tsx
<span className="coordinate-marker">#SYS-001</span>
<span className="coordinate-marker">#TRACK-LIST-001</span>
<span className="coordinate-marker">#DETAIL-PANEL</span>
```

**Usage:**
- Bottom corners of screens
- Panel headers
- Section identifiers

**Styling:**
- Font: JetBrains Mono
- Size: 10px (0.625rem)
- Color: Gray (#6B7280)
- Opacity: 70%

### Section Codes

```tsx
<span className="section-code">#CHAR-ROSTER</span>
<span className="section-code">#RESULT-SCREEN-001</span>
```

**Styling:**
- Font: JetBrains Mono
- Size: 12px (0.75rem)
- Color: Medium gray (#3D4451)
- Uppercase
- Letter spacing: 0.1em

---

## Grid System

### Technical Grid Background

```tsx
<div className="tech-grid-bg">
  {/* Content */}
</div>
```

**Features:**
- 24px × 24px grid
- Very light gray lines (rgba(209, 213, 219, 0.3))
- Subtle radial gradients in corners
- Non-intrusive, maintains readability

---

## Best Practices

### Do's ✅
- Use uppercase for headings and labels
- Apply technical labels to corners
- Maintain high contrast between text and backgrounds
- Use flat colors and minimal gradients
- Keep borders thin (1-2px)
- Use accent colors sparingly for emphasis
- Ensure all interactive elements have clear hover states

### Don'ts ❌
- Avoid glossy or skeuomorphic effects
- Don't use heavy drop shadows
- Avoid low-contrast color combinations
- Don't overuse rounded corners
- Avoid cluttered layouts
- Don't use accent colors for large areas

---

## Implementation Notes

### CSS Custom Properties
All design tokens are defined as CSS custom properties in `app/globals.css` for easy theming and consistency.

### Tailwind v4
The project uses Tailwind v4 with custom utilities defined using `@utility` directive.

### Component Library
All reusable components are in `components/ui/` and `components/rhythm/` directories.

### Type Safety
TypeScript interfaces ensure type safety across all components and data structures.

---

## Resources

- **Fonts**: Google Fonts (Space Grotesk, Inter, JetBrains Mono)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Framework**: Next.js 16 with App Router

---

## Version History

- **v1.0.0** (2025-01-09): Initial light-mode design system release