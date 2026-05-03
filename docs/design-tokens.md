# Design Tokens

All design tokens are defined as CSS variables in `src/renderer/src/styles/globals.css` and exposed through Tailwind in `tailwind.config.ts`.

## Background Tiers

| Token           | Tailwind         | HSL Value  | Use Case          |
| --------------- | ---------------- | ---------- | ----------------- |
| `--bg-deepest`  | `bg-bg-deepest`  | `0 0% 4%`  | App background    |
| `--bg-deep`     | `bg-bg-deep`     | `0 0% 6%`  | Input backgrounds |
| `--bg-surface`  | `bg-bg-surface`  | `0 0% 8%`  | Surface elements  |
| `--bg-elevated` | `bg-bg-elevated` | `0 0% 11%` | Cards, dialogs    |
| `--bg-hover`    | `bg-bg-hover`    | `0 0% 14%` | Hover states      |

## Borders

| Token              | Tailwind               | Use Case           |
| ------------------ | ---------------------- | ------------------ |
| `--border-subtle`  | `border-border-subtle` | Dividers           |
| `--border-default` | `border-border`        | Default borders    |
| `--border-strong`  | `border-border-strong` | Emphasized borders |

## Text

| Token              | Tailwind              | Use Case                  |
| ------------------ | --------------------- | ------------------------- |
| `--text-primary`   | `text-text-primary`   | Headings, primary content |
| `--text-secondary` | `text-text-secondary` | Body text                 |
| `--text-tertiary`  | `text-text-tertiary`  | Hints, metadata           |
| `--text-disabled`  | `text-text-disabled`  | Disabled state            |

## Accent (Electric Blue)

| Token                 | Tailwind                    | Use Case              |
| --------------------- | --------------------------- | --------------------- |
| `--accent`            | `bg-accent` / `text-accent` | Primary actions       |
| `--accent-hover`      | `bg-accent-hover`           | Accent hover          |
| `--accent-subtle`     | `bg-accent-subtle`          | Selection backgrounds |
| `--accent-foreground` | `text-accent-foreground`    | Text on accent        |

## Status Colors

| Token              | Tailwind            | Use Case         |
| ------------------ | ------------------- | ---------------- |
| `--status-success` | `bg-status-success` | Success messages |
| `--status-warning` | `bg-status-warning` | Warnings         |
| `--status-error`   | `bg-status-error`   | Errors           |
| `--status-info`    | `bg-status-info`    | Information      |

## Agent State Colors

| Token              | Tailwind            | Use Case         |
| ------------------ | ------------------- | ---------------- |
| `--agent-idle`     | `bg-agent-idle`     | Agent waiting    |
| `--agent-thinking` | `bg-agent-thinking` | Agent processing |
| `--agent-working`  | `bg-agent-working`  | Agent executing  |
| `--agent-done`     | `bg-agent-done`     | Agent completed  |
| `--agent-failed`   | `bg-agent-failed`   | Agent error      |

## Typography

- **UI Font:** Inter (loaded from Google Fonts)
- **Mono Font:** JetBrains Mono (loaded from Google Fonts)

## Font Sizes

| Token       | Size | Line Height |
| ----------- | ---- | ----------- |
| `text-xs`   | 11px | 16px        |
| `text-sm`   | 12px | 18px        |
| `text-base` | 13px | 20px        |
| `text-md`   | 14px | 22px        |
| `text-lg`   | 16px | 24px        |
| `text-xl`   | 18px | 28px        |
| `text-2xl`  | 24px | 32px        |

## Border Radius

| Token        | Value |
| ------------ | ----- |
| `rounded-sm` | 4px   |
| `rounded`    | 6px   |
| `rounded-md` | 8px   |
| `rounded-lg` | 12px  |
| `rounded-xl` | 16px  |

## Animations

| Token                | Description           |
| -------------------- | --------------------- |
| `animate-fade-in`    | Fade in over 150ms    |
| `animate-slide-up`   | Slide up over 200ms   |
| `animate-slide-down` | Slide down over 200ms |
| `animate-pulse`      | Continuous pulse      |
