"# rhythmDerby Light Theme Style Guide

## Design Philosophy

The light theme maintains the industrial sci-fi aesthetic while providing excellent readability and a clean, technical manual feel. It uses off-white and light gray panels with thin gray borders, ensuring high contrast for accessibility.

## Color Palette

### Background Colors
- **Primary Background**: `#FAFBFC` - Main page background
- **Secondary Background**: `#F4F6F8` - Secondary panels and sections
- **Tertiary Background**: `#EBEEF2` - Subtle background variations
- **Panel Background**: `#FFFFFF` - Main content panels
- **Overlay Background**: `rgba(255, 255, 255, 0.95)` - Modal and overlay backgrounds

### Text Colors
- **Primary Text**: `#1A1D21` - Main headings and important text
- **Secondary Text**: `#4A5568` - Body text and descriptions
- **Tertiary Text**: `#718096` - Labels and secondary information
- **Disabled Text**: `#A0AEC0` - Disabled states

### Accent Colors
- **Primary Accent**: `#0066CC` - Main interactive elements
- **Secondary Accent**: `#E53E3E` - Secondary actions and warnings
- **Success**: `#38A169` - Success states and positive feedback
- **Warning**: `#D69E2E` - Warning states and caution
- **Danger**: `#E53E3E` - Error states and destructive actions

### Borders & Separators
- **Primary Border**: `#E2E8F0` - Main panel borders
- **Secondary Border**: `#CBD5E0` - Secondary element borders
- **Accent Border**: `#0066CC` - Highlighted element borders
- **Separator**: `#EDF2F7` - Content separators

## Typography

### Font Families
- **Display Font**: 'Orbitron', sans-serif - Headers and technical labels
- **Body Font**: 'Inter', sans-serif - Body text and UI elements
- **Monospace Font**: 'JetBrains Mono', monospace - Code and technical data

### Typography Scale
- **H1**: 2.5rem, 900 weight - Main page titles
- **H2**: 2rem, 800 weight - Section headers
- **H3**: 1.5rem, 700 weight - Subsection headers
- **H4**: 1.25rem, 600 weight - Component titles
- **H5**: 1.125rem, 600 weight - Small headers
- **H6**: 1rem, 600 weight - Labels and captions

## Component Guidelines

### Panels
- Use white backgrounds with subtle gray borders
- Add left accent borders for primary panels
- Include coordinate markers in top-right corners
- Maintain consistent padding (24px)

### Buttons
- **Primary**: Blue background with white text
- **Secondary**: Transparent with blue border and text
- **Danger**: Red background with white text
- **Ghost**: Transparent with gray text, hover to blue

### Status Bars
- Light gray background with colored fill
- Animated width transitions
- Include value labels and percentages
- Use semantic colors (green=good, yellow=warning, red=danger)

### Cards
- White background with gray borders
- Subtle hover effects (lift and border color change)
- Selected state with blue accent border and background tint
- Include left accent bar for selected items

## Accessibility

### Contrast Ratios
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have clear focus states
- Color is never the only indicator of state

### Focus Management
- Blue outline for keyboard navigation
- Consistent focus ring styling
- Logical tab order throughout interface

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex components
- Status announcements for dynamic content

## Animation Guidelines

### Micro-interactions
- Subtle hover effects (scale: 1.02, translateY: -1px)
- Smooth transitions (200ms ease)
- Loading states with spinner animations

### Page Transitions
- Staggered entrance animations
- Fade and slide effects
- Respect user motion preferences

## Usage Examples

### Panel Structure
```tsx
<TechPanel 
  title="SYSTEM STATUS" 
  coordinates="[A1-C4]"
  variant="primary"
>
  <StatusBar label="CPU USAGE" value={75} color="warning" />
  <StatusBar label="MEMORY" value={45} color="success" />
</TechPanel>
```
