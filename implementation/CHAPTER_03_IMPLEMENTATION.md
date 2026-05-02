# 📘 Chapter 3 Implementation Plan: Design System & Theme Foundation

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 3 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. If a command fails, read the error carefully. Do not guess solutions.
> 5. Use `npm` only (not yarn or pnpm) unless the user explicitly says otherwise.
> 6. Run all commands from the project root directory unless specified otherwise.
> 7. After completing this chapter, run the FINAL VERIFICATION at the bottom.
> 8. The chapter is ONLY complete when ALL final verification checks pass.
> 9. **PREREQUISITE:** Chapters 1 and 2 must be fully complete with all verification checks passing.

---

## 🎯 Chapter 3 Goal

Build a complete dark-mode design system that establishes the Antigravity aesthetic before any features are added. This chapter creates the visual foundation that every component in later chapters will use.

## 📋 What Will Exist When This Chapter Is Done

- Tailwind CSS v3 fully configured with custom dark theme
- shadcn/ui-compatible component primitives
- Complete CSS variable token system for colors, spacing, typography
- Inter (UI) and JetBrains Mono (code) fonts loaded properly
- 9 core UI primitives: Button, Input, Textarea, Select, Modal, Tooltip, Toast, Tabs, Resizable Panel
- A `ComponentShowcase` route to visually test all primitives
- Documented design tokens in `docs/design-tokens.md`
- All previous chapters' functionality intact

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command to run:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

**If errors occur:** STOP. Fix Chapter 1/2 issues first.

## Task 1.2: Verify Dev Mode Works

**Command to run:**

```bash
npm run dev
```

**Expected:** App opens with custom title bar from Chapter 2.

**Action:** Close the window. Proceed.

---

# 📦 SECTION 2: Install Dependencies

## Task 2.1: Install Tailwind CSS

**Command to run:**

```bash
npm install -D tailwindcss@^3.4.7 postcss@^8.4.40 autoprefixer@^10.4.19
```

**Expected:** Packages install successfully.

## Task 2.2: Install Component Library Dependencies

**Command to run:**

```bash
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
```

## Task 2.3: Install Radix UI Primitives (for shadcn/ui-style components)

**Command to run:**

```bash
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-toast
```

## Task 2.4: Install React Resizable Panels

**Command to run:**

```bash
npm install react-resizable-panels
```

## Task 2.5: Verify All Installs

**Command to run:**

```bash
npm list tailwindcss class-variance-authority @radix-ui/react-dialog react-resizable-panels
```

**Expected:** All packages listed with versions.

---

# 📦 SECTION 3: Initialize Tailwind

## Task 3.1: Create Tailwind Config

**File path:** `tailwind.config.ts`

**Action:** Create this NEW file with exact content below.

**Exact content:**

```typescript
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deepest: 'hsl(var(--bg-deepest))',
          deep: 'hsl(var(--bg-deep))',
          surface: 'hsl(var(--bg-surface))',
          elevated: 'hsl(var(--bg-elevated))',
          hover: 'hsl(var(--bg-hover))'
        },
        border: {
          subtle: 'hsl(var(--border-subtle))',
          DEFAULT: 'hsl(var(--border-default))',
          strong: 'hsl(var(--border-strong))'
        },
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          tertiary: 'hsl(var(--text-tertiary))',
          disabled: 'hsl(var(--text-disabled))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          hover: 'hsl(var(--accent-hover))',
          subtle: 'hsl(var(--accent-subtle))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        status: {
          success: 'hsl(var(--status-success))',
          warning: 'hsl(var(--status-warning))',
          error: 'hsl(var(--status-error))',
          info: 'hsl(var(--status-info))'
        },
        agent: {
          idle: 'hsl(var(--agent-idle))',
          thinking: 'hsl(var(--agent-thinking))',
          working: 'hsl(var(--agent-working))',
          done: 'hsl(var(--agent-done))',
          failed: 'hsl(var(--agent-failed))'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['13px', { lineHeight: '20px' }],
        md: ['14px', { lineHeight: '22px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }]
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px'
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [animate]
}

export default config
```

## Task 3.2: Create PostCSS Config

**File path:** `postcss.config.js`

**Action:** Create NEW file.

**Exact content:**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

# 📦 SECTION 4: Define Design Tokens (CSS Variables)

## Task 4.1: Replace globals.css with Token System

**File path:** `src/renderer/src/styles/globals.css`

**Action:** OVERWRITE entire file with this content.

**Exact content:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background tiers */
    --bg-deepest: 0 0% 4%;
    --bg-deep: 0 0% 6%;
    --bg-surface: 0 0% 8%;
    --bg-elevated: 0 0% 11%;
    --bg-hover: 0 0% 14%;

    /* Border tones */
    --border-subtle: 0 0% 12%;
    --border-default: 0 0% 18%;
    --border-strong: 0 0% 28%;

    /* Text tiers */
    --text-primary: 0 0% 98%;
    --text-secondary: 0 0% 80%;
    --text-tertiary: 0 0% 60%;
    --text-disabled: 0 0% 40%;

    /* Accent (electric blue) */
    --accent: 217 91% 60%;
    --accent-hover: 217 91% 65%;
    --accent-subtle: 217 91% 20%;
    --accent-foreground: 0 0% 100%;

    /* Status colors */
    --status-success: 142 71% 45%;
    --status-warning: 38 92% 50%;
    --status-error: 0 84% 60%;
    --status-info: 199 89% 48%;

    /* Agent state colors */
    --agent-idle: 0 0% 50%;
    --agent-thinking: 38 92% 50%;
    --agent-working: 217 91% 60%;
    --agent-done: 142 71% 45%;
    --agent-failed: 0 84% 60%;

    /* Spacing scale (in rems based on 4px) */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    @apply bg-bg-deepest text-text-primary font-sans text-base antialiased;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: hsl(var(--border-default));
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--border-strong));
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 2px;
  }

  /* Selection */
  ::selection {
    background: hsl(var(--accent-subtle));
    color: hsl(var(--text-primary));
  }
}

@layer components {
  .app-container {
    @apply flex flex-col h-screen w-screen bg-bg-deepest;
  }
}
```

---

# 📦 SECTION 5: Load Fonts

## Task 5.1: Create Fonts Folder

**Command to run:**

```bash
mkdir -p src/renderer/src/assets/fonts
```

## Task 5.2: Add Font Loading via Google Fonts

**File path:** `src/renderer/index.html`

**Action:** OVERWRITE entire file.

**Exact content:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ws: wss: http://localhost:* https://fonts.googleapis.com https://fonts.gstatic.com;"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>Agent Flow Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

---

# 📦 SECTION 6: Utility Functions

## Task 6.1: Create cn Utility (Tailwind class merger)

**File path:** `src/renderer/src/lib/utils.ts`

**Action:** Create NEW file.

**Command to run first:**

```bash
mkdir -p src/renderer/src/lib
```

**Exact content:**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

---

# 📦 SECTION 7: Build UI Primitives

## Task 7.1: Create Components Folder Structure

**Command to run:**

```bash
mkdir -p src/renderer/src/components/ui
```

## Task 7.2: Button Component

**File path:** `src/renderer/src/components/ui/Button.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-foreground hover:bg-accent-hover',
        secondary: 'bg-bg-elevated text-text-primary border border-border hover:bg-bg-hover',
        ghost: 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
        danger: 'bg-status-error text-white hover:opacity-90',
        outline: 'border border-border bg-transparent text-text-primary hover:bg-bg-elevated'
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        default: 'h-8 px-3',
        lg: 'h-10 px-4 text-md',
        icon: 'h-8 w-8 p-0'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

## Task 7.3: Input Component

**File path:** `src/renderer/src/components/ui/Input.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full rounded-md border border-border bg-bg-deep px-3 py-1 text-base text-text-primary placeholder:text-text-tertiary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
```

## Task 7.4: Textarea Component

**File path:** `src/renderer/src/components/ui/Textarea.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-border bg-bg-deep px-3 py-2 text-base text-text-primary placeholder:text-text-tertiary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors resize-y',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
```

## Task 7.5: Dialog (Modal) Component

**File path:** `src/renderer/src/components/ui/Dialog.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-in',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-bg-elevated p-6 shadow-lg',
        'data-[state=open]:animate-slide-up',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none transition-opacity">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex flex-col space-y-1.5', className)} {...props} />
)

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('flex justify-end space-x-2', className)} {...props} />
)

const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-text-primary', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
}
```

## Task 7.6: Tooltip Component

**File path:** `src/renderer/src/components/ui/Tooltip.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../lib/utils'

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md bg-bg-hover border border-border px-2 py-1 text-xs text-text-primary shadow-md',
      'animate-fade-in',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

## Task 7.7: Tabs Component

**File path:** `src/renderer/src/components/ui/Tabs.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-md bg-bg-elevated p-1 text-text-secondary',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium',
      'transition-all',
      'data-[state=active]:bg-bg-surface data-[state=active]:text-text-primary',
      'hover:text-text-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

## Task 7.8: Select Component

**File path:** `src/renderer/src/components/ui/Select.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-8 w-full items-center justify-between rounded-md border border-border bg-bg-deep px-3 py-1 text-base',
      'text-text-primary',
      'focus:outline-none focus:ring-2 focus:ring-accent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[placeholder]:text-text-tertiary',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-bg-elevated text-text-primary shadow-md',
        'data-[state=open]:animate-fade-in',
        position === 'popper' && 'data-[side=bottom]:translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-bg-hover',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem }
```

## Task 7.9: Toast Component (Simplified)

**File path:** `src/renderer/src/components/ui/Toast.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState, type ReactNode } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  title?: string
  description?: ReactNode
  variant?: ToastVariant
  duration?: number
  onDismiss?: (id: string) => void
}

const variantConfig = {
  success: { icon: CheckCircle2, color: 'text-status-success' },
  error: { icon: AlertCircle, color: 'text-status-error' },
  info: { icon: Info, color: 'text-status-info' },
  warning: { icon: AlertTriangle, color: 'text-status-warning' }
}

export function Toast({
  id,
  title,
  description,
  variant = 'info',
  duration = 4000,
  onDismiss
}: ToastProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true)
  const { icon: Icon, color } = variantConfig[variant]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss?.(id), 200)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border border-border bg-bg-elevated p-3 shadow-lg min-w-[320px] max-w-[420px]',
        'transition-all duration-200',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', color)} />
      <div className="flex-1">
        {title && <p className="text-sm font-medium text-text-primary">{title}</p>}
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onDismiss?.(id), 200)
        }}
        className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): JSX.Element {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}
```

## Task 7.10: Resizable Panel Component

**File path:** `src/renderer/src/components/ui/Resizable.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { GripVertical } from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'
import { cn } from '../../lib/utils'

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>): JSX.Element => (
  <ResizablePrimitive.PanelGroup
    className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}): JSX.Element => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-px items-center justify-center bg-border-subtle',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
      'hover:bg-accent transition-colors',
      'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
      'data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1',
      'data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2',
      'data-[panel-group-direction=vertical]:after:translate-x-0',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-bg-elevated">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

## Task 7.11: Index Export File

**File path:** `src/renderer/src/components/ui/index.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export * from './Button'
export * from './Input'
export * from './Textarea'
export * from './Dialog'
export * from './Tooltip'
export * from './Tabs'
export * from './Select'
export * from './Toast'
export * from './Resizable'
```

---

# 📦 SECTION 8: Component Showcase Route

## Task 8.1: Create Showcase Component

**File path:** `src/renderer/src/routes/ComponentShowcase.tsx`

**Action:** Create NEW file.

**Command first:**

```bash
mkdir -p src/renderer/src/routes
```

**Exact content:**

```typescript
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/Dialog'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/Tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../components/ui/Select'
import { ToastContainer, type ToastProps } from '../components/ui/Toast'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/Resizable'

export default function ComponentShowcase(): JSX.Element {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (variant: ToastProps['variant']): void => {
    const id = String(Date.now())
    setToasts((prev) => [
      ...prev,
      {
        id,
        title: `${variant} toast`,
        description: 'This is a sample toast notification.',
        variant
      }
    ])
  }

  const dismissToast = (id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-2xl font-semibold mb-2">Component Showcase</h1>
            <p className="text-text-secondary">All UI primitives for visual verification.</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Buttons</h2>
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex gap-2 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Inputs</h2>
            <div className="grid grid-cols-2 gap-4 max-w-xl">
              <Input placeholder="Type something..." />
              <Input placeholder="Disabled input" disabled />
              <Textarea placeholder="Type a message..." className="col-span-2" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Select</h2>
            <Select>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-opus">Claude Opus</SelectItem>
                <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Dialog</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>
                    This is a sample dialog. Click outside or the close button to dismiss.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Tooltip</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Tabs</h2>
            <Tabs defaultValue="tab1" className="max-w-md">
              <TabsList>
                <TabsTrigger value="tab1">Chat</TabsTrigger>
                <TabsTrigger value="tab2">Flow</TabsTrigger>
                <TabsTrigger value="tab3">Tools</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 border border-border rounded-md">
                Chat content
              </TabsContent>
              <TabsContent value="tab2" className="p-4 border border-border rounded-md">
                Flow content
              </TabsContent>
              <TabsContent value="tab3" className="p-4 border border-border rounded-md">
                Tools content
              </TabsContent>
            </Tabs>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Toasts</h2>
            <div className="flex gap-2">
              <Button onClick={() => addToast('success')}>Success</Button>
              <Button onClick={() => addToast('error')} variant="danger">
                Error
              </Button>
              <Button onClick={() => addToast('info')} variant="secondary">
                Info
              </Button>
              <Button onClick={() => addToast('warning')} variant="outline">
                Warning
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Resizable Panels</h2>
            <div className="h-[200px] border border-border rounded-md overflow-hidden">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30}>
                  <div className="h-full flex items-center justify-center bg-bg-surface">
                    Panel 1
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={70}>
                  <div className="h-full flex items-center justify-center bg-bg-elevated">
                    Panel 2
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Color Tokens</h2>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-bg-deepest border border-border p-3 rounded">bg-deepest</div>
              <div className="bg-bg-deep border border-border p-3 rounded">bg-deep</div>
              <div className="bg-bg-surface border border-border p-3 rounded">bg-surface</div>
              <div className="bg-bg-elevated border border-border p-3 rounded">bg-elevated</div>
              <div className="bg-accent text-accent-foreground p-3 rounded">accent</div>
              <div className="bg-status-success text-white p-3 rounded">success</div>
              <div className="bg-status-error text-white p-3 rounded">error</div>
              <div className="bg-status-warning text-white p-3 rounded">warning</div>
            </div>
          </section>
        </div>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </TooltipProvider>
  )
}
```

---

# 📦 SECTION 9: Update App.tsx

## Task 9.1: Update App to Show Showcase

**File path:** `src/renderer/src/App.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'
import ComponentShowcase from './routes/ComponentShowcase'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')

  useEffect(() => {
    if (window.api) {
      setAppName(window.api.appName)
    }
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <ComponentShowcase />
    </div>
  )
}

export default App
```

---

# 📦 SECTION 10: Update Title Bar to Use Tailwind

## Task 10.1: Update TitleBar Component

**File path:** `src/renderer/src/components/TitleBar/TitleBar.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TitleBarProps {
  title?: string
}

function TitleBar({ title = 'Agent Flow Manager' }: TitleBarProps): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [platform, setPlatform] = useState<string>('win32')

  useEffect(() => {
    const init = async (): Promise<void> => {
      if (window.platform) {
        const detectedPlatform = await window.platform.get()
        setPlatform(detectedPlatform)
      }
      if (window.windowControls) {
        const initialState = await window.windowControls.isMaximized()
        setIsMaximized(initialState)
      }
    }
    init()
    if (window.windowControls) {
      const unsubscribe = window.windowControls.onMaximizedChange(setIsMaximized)
      return unsubscribe
    }
    return undefined
  }, [])

  const isMac = platform === 'darwin'

  return (
    <div
      className={cn(
        'flex items-center h-9 bg-bg-deepest border-b border-border-subtle select-none flex-shrink-0',
        isMac && 'pl-20'
      )}
      style={{ zIndex: 1000 }}
    >
      <div
        className="flex-1 h-full flex items-center px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onDoubleClick={() => window.windowControls?.maximize()}
      >
        <span className="text-xs font-medium text-text-secondary tracking-wide pointer-events-none">
          {title}
        </span>
      </div>

      {!isMac && (
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={() => window.windowControls?.minimize()}
            className="flex items-center justify-center w-[46px] h-full text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => window.windowControls?.maximize()}
            className="flex items-center justify-center w-[46px] h-full text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            onClick={() => window.windowControls?.close()}
            className="flex items-center justify-center w-[46px] h-full text-text-tertiary hover:bg-status-error hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default TitleBar
```

## Task 10.2: Delete Old TitleBar.css

**Command to run:**

```bash
rm src/renderer/src/components/TitleBar/TitleBar.css
```

**Note:** The CSS is no longer needed; styles are now Tailwind classes.

---

# 📦 SECTION 11: Documentation

## Task 11.1: Create docs Folder

**Command to run:**

```bash
mkdir -p docs
```

## Task 11.2: Create Design Tokens Documentation

**File path:** `docs/design-tokens.md`

**Action:** Create NEW file.

**Exact content:**

```markdown
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
```

---

# 📦 SECTION 12: Update Tests

## Task 12.1: Update Test File

**File path:** `tests/unit/App.test.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'api', {
      value: { appName: 'Agent Flow Manager', appVersion: '0.1.0' },
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'platform', {
      value: {
        get: vi.fn().mockResolvedValue('win32'),
        getVersion: vi.fn().mockResolvedValue('0.1.0')
      },
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'windowControls', {
      value: {
        minimize: vi.fn(),
        maximize: vi.fn(),
        close: vi.fn(),
        isMaximized: vi.fn().mockResolvedValue(false),
        onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getAllByText(/Agent Flow Manager/i).length).toBeGreaterThan(0)
  })

  it('renders the component showcase', () => {
    render(<App />)
    expect(screen.getByText(/Component Showcase/i)).toBeInTheDocument()
  })

  it('renders all section headers', () => {
    render(<App />)
    expect(screen.getByText(/^Buttons$/)).toBeInTheDocument()
    expect(screen.getByText(/^Inputs$/)).toBeInTheDocument()
    expect(screen.getByText(/^Dialog$/)).toBeInTheDocument()
  })
})
```

---

# 📦 SECTION 13: Verify Everything

## Task 13.1: Run Type Check

**Command:**

```bash
npm run typecheck
```

**Expected:** Exit code 0.

## Task 13.2: Run Lint

**Command:**

```bash
npm run lint
```

**Expected:** Exit code 0.

## Task 13.3: Run Format

**Command:**

```bash
npm run format
```

## Task 13.4: Run Tests

**Command:**

```bash
npm run test:run
```

**Expected:** 3 tests pass.

## Task 13.5: Production Build

**Command:**

```bash
npm run build
```

**Expected:** Exit code 0.

---

# 📦 SECTION 14: Visual Verification

## Task 14.1: Launch Dev Mode

**Command:**

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] App launches with custom title bar
- [ ] Component Showcase page is visible
- [ ] All buttons render with proper colors (primary blue, secondary gray, danger red, etc.)
- [ ] Hovering buttons changes their color
- [ ] Input fields are visible and dark-themed
- [ ] Clicking "Open Dialog" opens a modal
- [ ] Hovering "Hover me" shows a tooltip
- [ ] Tabs switch content when clicked
- [ ] Select dropdown opens with model options
- [ ] Toast buttons trigger notifications that auto-dismiss
- [ ] Resizable panels can be dragged to resize
- [ ] Color tokens section shows all colors
- [ ] Fonts look modern (Inter for UI)
- [ ] Scrollbar is thin and dark-themed
- [ ] No native OS title bar visible

**Stop the app after verification.**

---

# 📦 SECTION 15: Git Commit

## Task 15.1: Stage and Commit

**Commands:**

```bash
git add .
git commit -m "feat: design system and UI primitives (Chapter 3)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Tailwind config exists

```bash
ls tailwind.config.ts postcss.config.js
```

## ✅ Check 2: All UI components exist

```bash
ls src/renderer/src/components/ui/Button.tsx src/renderer/src/components/ui/Input.tsx src/renderer/src/components/ui/Dialog.tsx src/renderer/src/components/ui/Tooltip.tsx src/renderer/src/components/ui/Tabs.tsx src/renderer/src/components/ui/Select.tsx src/renderer/src/components/ui/Toast.tsx src/renderer/src/components/ui/Resizable.tsx src/renderer/src/components/ui/Textarea.tsx
```

## ✅ Check 3: Showcase exists

```bash
ls src/renderer/src/routes/ComponentShowcase.tsx
```

## ✅ Check 4: Documentation exists

```bash
ls docs/design-tokens.md
```

## ✅ Check 5: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 6: Lint passes

```bash
npm run lint
```

## ✅ Check 7: Tests pass

```bash
npm run test:run
```

## ✅ Check 8: Build works

```bash
npm run build
```

## ✅ Check 9: Visual verification complete (user confirmed)

## ✅ Check 10: Git commit made

```bash
git log --oneline
```

---

# 📊 Chapter 3 Completion Report

```
✅ Chapter 3: Design System & Theme Foundation - COMPLETE

Acceptance Criteria Met:
✅ Tailwind CSS configured with custom theme
✅ shadcn/ui-style components installed
✅ Complete color token system defined
✅ Typography (Inter + JetBrains Mono) loaded
✅ 9 UI primitives created and working
✅ Component showcase route functional
✅ Design tokens documented
✅ All tests passing
✅ Production build works

Deliverables Created:
- tailwind.config.ts, postcss.config.js
- src/renderer/src/lib/utils.ts
- src/renderer/src/components/ui/* (9 components)
- src/renderer/src/routes/ComponentShowcase.tsx
- docs/design-tokens.md

Ready to proceed to Chapter 4: Local Storage & Database Layer.
```

---

# 🚨 Troubleshooting

## Tailwind classes not applying

- Verify `globals.css` has `@tailwind` directives
- Verify `tailwind.config.ts` content paths cover all source files
- Restart dev server

## Fonts not loading

- Check internet connection (loaded from Google Fonts)
- Verify CSP in index.html allows fonts.googleapis.com

## Components throwing "Cannot find module @radix-ui/..."

- Run `npm install` to ensure all Radix packages installed

## Dialog not centered

- Verify Dialog uses Portal correctly (it should via Radix)

---

**End of Chapter 3 Implementation Plan**
