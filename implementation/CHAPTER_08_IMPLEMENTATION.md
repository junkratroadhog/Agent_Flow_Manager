# 📘 Chapter 8 Implementation Plan: Tab System & Multi-View Support

🎯 **Chapter Goal:** Build a robust tab system supporting mixed content types (chat, files, diff, flow, terminal, plan) with VS Code-style interactions and persistence.

---

## 📋 Section 1: State & Types

### Task 1.1: Define Tab Types

**File:** `src/renderer/src/components/Tabs/types.ts`

- Define `TabType` (chat, editor, diff, etc.)
- Define `TabMetadata` (id, type, title, icon, pinned, modified, data)

### Task 1.2: Update UI Store

**File:** `src/renderer/src/stores/uiStore.ts`

- Add `tabs: TabMetadata[]`
- Add `activeTabId: string | null`
- Add actions:
  - `addTab(tab: Partial<TabMetadata>)`
  - `closeTab(id: string)`
  - `setActiveTab(id: string)`
  - `reorderTabs(startIndex: number, endIndex: number)`
  - `updateTab(id: string, updates: Partial<TabMetadata>)`

---

## 📋 Section 2: UI Components

### Task 2.1: Individual Tab Component

**File:** `src/renderer/src/components/Tabs/TabItem.tsx`

- Show icon, title, close button
- Handle active/inactive states
- Handle "modified" (dirty) indicator
- Handle pinned state
- Context menu: "Close Other Tabs", "Close Tabs to the Right", etc.

### Task 2.2: Tab Bar Container

**File:** `src/renderer/src/components/Tabs/TabBar.tsx`

- Horizontal scrolling strip
- Drag and drop reordering (using `dnd-kit` or simple pointer events)
- "New Tab" button
- Overflow handling

### Task 2.3: Tab Content Renderer

**File:** `src/renderer/src/components/Tabs/TabContentRenderer.tsx`

- Switch component that renders the correct view based on `tab.type`
- Placeholder components for each type

---

## 📋 Section 3: Integration

### Task 3.1: Update MainContent

**File:** `src/renderer/src/components/Layout/MainContent.tsx`

- Replace welcome screen with `TabBar` and the active tab's content.

### Task 3.2: Keyboard Shortcuts

**File:** `src/renderer/src/components/Layout/AppShell.tsx`

- Ctrl+T: New Chat
- Ctrl+W: Close Tab
- Ctrl+Tab / Ctrl+Shift+Tab: Cycle tabs

---

## ✅ Acceptance Criteria

- [ ] Tabs can be opened and closed
- [ ] Active tab is highlighted
- [ ] Middle-click on tab closes it
- [ ] Tabs persist across app restarts
- [ ] Smooth horizontal scrolling for many tabs
- [ ] Different view types render correctly (even as placeholders)
- [ ] Keyboard shortcuts work as expected

---

## 🧪 Tests

- [ ] Unit tests for `uiStore` tab actions
- [ ] Component tests for `TabItem` (close click, etc.)
- [ ] Integration test: Opening a new tab switches focus to it
