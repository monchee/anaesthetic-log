# Navigation Redesign Implementation Plan

I'm using the writing-plans skill to create the implementation plan.

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement a persistent, professional sidebar navigation (Clinical Command Center) for desktop and a standard drawer for mobile/tablet.

**Architecture:** Use `SidebarProvider` at the root for state management. Update `ScreenLayout.tsx` to a side-by-side flex layout. Introduce `AnaestheticSidebar.tsx` for clinical context and navigation links.

**Tech Stack:** React, Tailwind CSS, shadcn/ui (Sidebar, Sheet), Lucide React.

---

### Task 1: Setup Shadcn Sidebar Component

**Files:**
- Create: `components/ui/sidebar.tsx` (via shadcn CLI)

**Step 1: Add the component**
Run: `npx shadcn@latest add sidebar`
Expected: `sidebar.tsx` and related sub-components created in `components/ui/`.

**Step 2: Commit**
```bash
git add components/ui/sidebar.tsx
git commit -m "feat: add shadcn sidebar component"
```

### Task 2: Create Clinical Sidebar Component

**Files:**
- Create: `components/AnaestheticSidebar.tsx`
- Test: `components/AnaestheticSidebar.test.tsx`

**Step 1: Write initial test**
Create `components/AnaestheticSidebar.test.tsx` and add a test to verify it renders the "Dashboard" link.

**Step 2: Implement AnaestheticSidebar**
- Use `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter` from shadcn.
- Match "Option 1" design: Slate-950 theme, Patient Card at top, Core links in middle, Info links at bottom.
- Use `useAnaestheticApp` hook for current patient info and screen state.

**Step 3: Run tests**
Run: `npm run test components/AnaestheticSidebar.test.tsx`
Expected: PASS

**Step 4: Commit**
```bash
git add components/AnaestheticSidebar.tsx components/AnaestheticSidebar.test.tsx
git commit -m "feat: implement AnaestheticSidebar component"
```

### Task 3: Integrate Sidebar into Layout

**Files:**
- Modify: `App.tsx`
- Modify: `components/ScreenLayout.tsx`

**Step 1: Wrap App with SidebarProvider**
Modify `App.tsx` (around line 656) to wrap `AnaestheticLogApp` with `<SidebarProvider>`.

**Step 2: Update ScreenLayout.tsx**
- Replace the existing `header` and `main` structure with a `SidebarProvider`-aware layout.
- Use `AnaestheticSidebar` within the layout.
- Implement the desktop/mobile toggle behavior.

**Step 3: Verify existing tests**
Run: `npm run test src/App.test.tsx`
Expected: PASS

**Step 4: Commit**
```bash
git add App.tsx components/ScreenLayout.tsx
git commit -m "feat: integrate sidebar into application layout"
```

### Task 4: Final Polishing & Verification

**Manual Verification:**
1. Open the app in a browser.
2. Verify sidebar is visible on desktop.
3. Resize to mobile width (<768px) and verify sidebar disappears, replaced by a hamburger menu.
4. Verify "Patient Card" updates when a patient is selected in the "New Log" flow.
5. Click through all links to ensure screen navigation works correctly.

**Final Commit:**
```bash
git add .
git commit -m "style: final polish for navigation redesign"
```
