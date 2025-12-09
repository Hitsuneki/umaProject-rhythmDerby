# rhythmDerby UI Design System

## Overview
Industrial sci-fi design system inspired by Arknights: Endfield, featuring nu-brutalist aesthetics with technical precision and minimal futuristic elements.

## Color Palette

### Core Colors
- **Primary Background**: `#0A0B0D` - Deep space black
- **Secondary Background**: `#151619` - Charcoal grey  
- **Panel Background**: `#242730` - Industrial grey
- **Text Primary**: `#FFFFFF` - Pure white
- **Text Secondary**: `#B8BCC8` - Light grey

### Accent Colors
- **Primary Accent**: `#00D4FF` - Cyan blue (main interactive)
- **Secondary Accent**: `#FF6B35` - Orange red (secondary actions)
- **Success**: `#10B981` - Green (positive states)
- **Warning**: `#F59E0B` - Amber (caution states)
- **Danger**: `#EF4444` - Red (error/critical states)

## Typography

### Font Stack
- **Display**: Orbitron (headings, UI labels)
- **Body**: Inter (readable text)
- **Monospace**: JetBrains Mono (technical data, codes)

### Hierarchy
- **H1**: 2.5rem, 900 weight - Main titles
- **H2**: 2rem, 800 weight - Section headers
- **H3**: 1.5rem, 700 weight - Subsections
- **Body**: 1rem, 400 weight - Standard text
- **Technical**: 0.75rem, 500 weight - Data displays

## Components

### Buttons
- **Primary**: Cyan background, high contrast
- **Secondary**: Transparent with cyan border
- **Danger**: Red background for destructive actions
- **Ghost**: Minimal styling for subtle actions

### Panels
- **Primary**: Standard content container with accent border
- **Secondary**: Subdued variant for less important content
- **Accent**: Highlighted panels with glow effect

### Status Elements
- **Status Bars**: Animated progress indicators
- **Badges**: Small status indicators
- **Notifications**: Toast-style system messages

## Layout Principles

### Grid System
- 12-column responsive grid
- 24px base spacing unit
- Technical grid overlay for industrial feel

### Spacing
- **Micro**: 4px - Element spacing
- **Small**: 8px - Component spacing  
- **Medium**: 16px - Section spacing
- **Large**: 24px - Layout spacing
- **XL**: 48px - Major section breaks

### Motion
- **Duration**: 200-400ms for interactions
- **Easing**: Ease-out for entrances, ease-in for exits
- **Scale**: 1.02x for hover states
- **Slide**: Directional animations for panels

## Usage Guidelines

### Do's
- Use high contrast for readability
- Maintain consistent spacing
- Apply technical labels to data
- Use coordinate markers for navigation
- Implement smooth but purposeful animations

### Don'ts
- Avoid glossy or overly decorative effects
- Don't use rounded corners excessively
- Avoid low contrast color combinations
- Don't animate without purpose
- Avoid cluttered layouts

## Accessibility

### Contrast Ratios
- Text on background: 7:1 minimum
- Interactive elements: 4.5:1 minimum
- Status indicators: Clear color + text labels

### Keyboard Navigation
- All interactive elements focusable
- Clear focus indicators
- Logical tab order

### Screen Readers
- Semantic HTML structure
- ARIA labels for complex components
- Alternative text for visual elements
