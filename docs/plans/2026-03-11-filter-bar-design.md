# Filter Design: The Utility Belt Filter Bar

## Purpose
The current inline filter box pushes main dashboard content down and consumes excessive vertical space, causing horizontal crowding and clutter. The new design shifts to a horizontal "Utility Belt" paradigm where filters act as dropdown popovers, maximizing dashboard real-estate while maintaining quick access and scannability.

## Architectural Approach
We will replace the static, expanded filter panel with a horizontal row of trigger buttons. Each button corresponds to a filter category and opens a floating popover containing the specific filter controls. 

This requires utilizing Radix UI / Shadcn's layout primitives, specifically the `Popover` component.

## Component Breakdown

### 1. The Utility Belt (Filter Bar)
- A horizontal `flex` container sitting below the search bar.
- Contains trigger buttons for each filter category:
  - **Reaction Severity**: Trigger shows "Severity: Any" or "Severity: Grade III".
  - **Procedure Outcome**: Trigger shows "Outcome: All" or "Outcome: Completed".
  - **Date Range**: Trigger shows "Date: All Time" or "Date: [Range]".
  - **Hospital**: Trigger shows "Hospital: All" or "Hospital: [Name]".
  - **Suspected Agents**: Trigger shows "Agents: 0 Selected" or "Agents: N Selected".

### 2. The Popovers
- Each trigger opens a `PopoverContent` that floats above the dashboard.
- Uses standard Shadcn `Popover` semantics to ensure proper z-indexing, click-outside-to-close behavior, and focus trapping.
- **Severity Popover**: Contains the existing Grade I-IV + Ungraded toggle buttons.
- **Outcome Popover**: Contains the All / Completed / Abandoned toggle group.
- **Date Range Popover**: Contains the From / To date inputs.
- **Hospital Popover**: Contains the standard `<select>` dropdown (or a Command/Combobox if we want to upgrade it, though simple `<select>` works for now).
- **Agent Combobox Popover**: A vertically scrollable list of agent badges with an integrated search input sticky at the top.

### 3. State & Interaction
- **Auto-Apply**: Filters are applied instantly as the user clicks options within the popover. No "Apply" button is required.
- **Active State Indicators**: Trigger buttons change styling (e.g., solid background color, heavier font weight, or primary text color) when their respective filter is active to indicate to the user that the data is filtered.
- **Clear All**: A discreet "Clear Filters" button appears at the end of the Utility Belt when any filter has a non-default state.

## Trade-offs and Considerations
- **Discoverability**: Options are hidden behind an extra click compared to the fully expanded box. *Mitigation*: The trigger buttons will clearly display the active state (e.g., "Agents: 2 Selected") so users aren't guessing what is applied.
- **Mobile responsiveness**: The horizontal bar might wrap on small screens. *Mitigation*: We will allow the flex container to wrap on mobile devices or use a horizontal scrolling container with hidden scrollbars for the triggers on very small viewports.

## Success Criteria
- The dashboard gains significant vertical space when filters are not being actively edited.
- Users can still quickly filter data with a maximum of two clicks (Open Popover -> Select Option).
- The dashboard behind the popovers responds instantly to changes without layout shift.
