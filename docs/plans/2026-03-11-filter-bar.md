# Filter Bar Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Replace the inline advanced search filters box with a horizontal "Utility Belt" filter bar using popovers for filter controls.

**Architecture:** We will leverage the existing `Popover` component from Shadcn (`components/ui/popover.tsx`). The `AdvancedSearchFilters` component will be refactored to render a horizontal row of trigger buttons. Each button will open a specific `PopoverContent` containing the relevant filter controls (Severity, Outcome, Date Range, Hospital, Agents). The state management in `useAdvancedSearch` remains largely untouched since the filter criteria logic doesn't change, only the presentation.

**Tech Stack:** React, TailwindCSS, Radix UI (Popover), Shadcn UI, Lucide React (Icons).

---

### Task 1: Refactor AdvancedSearchFilters Trigger Layout

**Files:**
- Modify: `src/features/dashboard/components/AdvancedSearchFilters.tsx`

**Step 1: Implement the base Utility Belt layout with Popovers**
We need to replace the expandable `<div className="w-full mt-4 p-5...">` with a horizontal flex container holding `Popover` components for each filter category. We'll start by scaffolding the imports and the main container.

```tsx
// Inside src/features/dashboard/components/AdvancedSearchFilters.tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// ... existing imports ...

// Replace the main return block:
return (
  <div className="flex flex-wrap items-center gap-3 w-full animate-in slide-in-from-top-2 fade-in duration-200">
     {/* Filter buttons will go here */}
     {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-3 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 ml-auto"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear All
        </Button>
      )}
  </div>
);
```

**Step 2: Run dev server to verify the UI changes**
Run: `npm run dev`
Expected: The app compiles and the large filter box is gone, replaced by an empty row (or just "Clear All" if filters are active).

### Task 2: Implement Severity, Outcome, and Date Range Popovers

**Files:**
- Modify: `src/features/dashboard/components/AdvancedSearchFilters.tsx`

**Step 1: Add the Severity, Outcome, and Date Range filters as Popovers**
For each category, add a `Popover` with a `PopoverTrigger` (styled as a badge/button) and `PopoverContent` containing the existing control logic.

*Example for Severity:*
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className={`h-8 border-dashed ${filters.grades.length > 0 ? "border-primary bg-primary/5 text-primary" : ""}`}>
      <Activity className="w-3.5 h-3.5 mr-2" />
      Severity
      {filters.grades.length > 0 && (
        <Badge variant="secondary" className="ml-2 px-1 text-[10px] rounded-sm">
          {filters.grades.length}
        </Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-4" align="start">
    {/* Existing Severity Buttons logic here */}
  </PopoverContent>
</Popover>
```
*Repeat similarly for Outcome and Date Range, adapting their specific existing logic into the `PopoverContent`.*

**Step 2: Run linter/typecheck**
Run: `npx tsc --noEmit`
Expected: PASS

### Task 3: Implement Hospital and Suspected Agents Popovers

**Files:**
- Modify: `src/features/dashboard/components/AdvancedSearchFilters.tsx`

**Step 1: Add the Hospital and Agents filters as Popovers**
Implement the final two filters. The "Suspected Agents" popover needs to include the search input and the scrollable list of agent badges just like the previous design, but constrained within the popover width.

*Example for Agents:*
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm" className={`h-8 border-dashed ${filters.suspectedAgents.length > 0 ? "border-primary bg-primary/5 text-primary" : ""}`}>
      <SearchIcon className="w-3.5 h-3.5 mr-2" />
      Agents
      {filters.suspectedAgents.length > 0 && (
        <Badge variant="secondary" className="ml-2 px-1 text-[10px] rounded-sm">
          {filters.suspectedAgents.length}
        </Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[300px] p-0" align="start">
    {/* Search Input in header */}
    <div className="p-2 border-b">
      <Input placeholder="Search agents..." /* ... */ />
    </div>
    {/* Scrollable list of agents */}
    <div className="p-2 max-h-[300px] overflow-y-auto">
       {/* List logic here */}
    </div>
  </PopoverContent>
</Popover>
```

**Step 2: Run tests**
Run: `npm run test:unit`
Expected: PASS. The existing filtering logic should not be impacted by the layout change.

### Task 4: Polish and Verify

**Files:**
- Modify: `src/features/dashboard/components/AdvancedSearchFilters.tsx`

**Step 1: Refactor and clean up dead code**
Remove any leftover layout wrapper `div`s, unused state (like `defaultExpanded` if no longer used conceptually, though technically the trigger button toggle state might be removed entirely since Popovers handle their own open state), and ensure Mobile responsiveness (wrapping the flex container).

**Step 2: Commit changes**
```bash
git add src/features/dashboard/components/AdvancedSearchFilters.tsx
git commit -m "feat(filters): redesign filter panel to use utility belt popover layout"
```
