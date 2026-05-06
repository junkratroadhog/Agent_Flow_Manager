import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { useUIStore } from '../../stores/uiStore'
import TabItem from './TabItem'

export default function TabBar(): JSX.Element {
  const tabs = useUIStore((s) => s.tabs)
  const activeTabId = useUIStore((s) => s.activeTabId)
  const addTab = useUIStore((s) => s.addTab)
  const reorderTabs = useUIStore((s) => s.reorderTabs)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // Avoid accidental drags when clicking
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleNewTab = (): void => {
    addTab({
      type: 'chat',
      title: 'New Chat'
    })
  }

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id)
      const newIndex = tabs.findIndex((t) => t.id === over.id)
      reorderTabs(oldIndex, newIndex)
    }
  }

  const scroll = (direction: 'left' | 'right'): void => {
    if (scrollContainerRef.current) {
      const amount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="flex items-center h-9 bg-bg-deep border-b border-border-subtle select-none">
      {/* Scroll Left Button */}
      <button
        onClick={(): void => scroll('left')}
        className="px-1 h-full hover:bg-bg-surface text-text-secondary transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Tabs list with DND */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto no-scrollbar scroll-smooth h-full"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext items={tabs.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
            {tabs.map((tab) => (
              <TabItem key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={(): void => scroll('right')}
        className="px-1 h-full hover:bg-bg-surface text-text-secondary transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      {/* New Tab Button */}
      <button
        onClick={handleNewTab}
        className="px-3 h-full hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-colors border-l border-border-subtle"
        title="New Chat (Ctrl+T)"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
