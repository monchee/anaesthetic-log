# Design Document: Navigation Redesign (Clinical Command Center)

**Date**: 2026-03-13
**Status**: Approved
**Goal**: Transition from a top-down navigation model to a persistent sidebar-driven model to improve clinical workflow efficiency and provide better context awareness for clinicians.

## User Review Summary

The user has approved **Option 1: Clinical Command Center**. Key preferences:
- **Desktop**: Always visible sidebar on the left.
- **Workflow Focus**: Sidebar prioritized for core clinical tasks (Dashboard, New Log, History).
- **Secondary Links**: Informational pages (About, FAQ) located at the bottom of the sidebar.
- **Mobile/Tablet**: Standard drawer triggered by a hamburger menu in a simplified top header.
- **Tools**: Use `shadcn/ui` (Sidebar) and `lucide-react` icons.

## Architecture & Layout

- **SidebarProvider**: Root-level context to manage navigation state (collapsible/expandable, mobile visibility).
- **Structure**:
  - `ScreenLayout.tsx` update: Implement a desktop flex container with a fixed sidebar (280px) and a main content area.
  - `AnaestheticSidebar.tsx`: New component to house navigation links and active patient context.
- **Responsive Strategy**: 
  - Desktop: Fixed sidebar.
  - Mobile/Tablet: Sidebar moved into a `Sheet` or `Drawer` component, toggled via a header button.

## Visual Design & Aesthetics

- **Color Palette**: Deep professional theme (`Slate-950` sidebar).
- **Typography**: Clean, high-readability sans-serif.
- **Active State**: Vibrant primary color (Indigo/Blue) for selected routes.
- **Patient Context**: A dedicated "Active Patient" card at the top of the sidebar showing MRN and Name when a patient is selected.
- **Icons**:
  - `LayoutDashboard` -> Dashboard
  - `PlusCircle` -> New Testing Log
  - `History` -> Recent Activity
  - `BookOpen` -> Drug Reference
  - `Settings` -> Resources/Secondary Links

## Success Criteria

1. **Orientation**: Clinicians can always see which patient is active and navigate between core screens without multiple clicks.
2. **Space Efficiency**: Desktop layout maximizes screen space for forms while keeping navigation accessible.
3. **Consistency**: Perfect parity between mobile drawer items and desktop sidebar items.
4. **Premium Feel**: Smooth transitions and cohesive theme that feels "medical-grade".

## Decision Record

- **Decided**: Option 1 (Clinical Command Center).
- **Rejected**: Minimalist icons-only sidebar (too high cognitive load for clinical environment); Widely spaced editorial layout (too much scrolling).
