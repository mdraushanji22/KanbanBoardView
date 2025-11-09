# Kanban Board Component

A fully functional, accessible, and performant Kanban Board component built with React, TypeScript, and Tailwind CSS.

## Live Storybook

[Deploy your Storybook to Netlify and add the URL here: https://kanbanboardsview.netlify.app/]

To view locally, run:

```bash
npm run storybook
```

## Installation

```bash
npm install
npm run storybook
```

## Architecture

The Kanban Board component is built with a modular architecture:

- **Components**: Reusable UI components (KanbanBoard, KanbanColumn, KanbanCard, TaskModal) and primitives (Button, Modal, Avatar)
- **Hooks**: Custom hooks for drag-and-drop logic (`useDragAndDrop`) and board state management (`useKanbanBoard`)
- **Utils**: Utility functions for task and column operations, date formatting, and common helpers
- **Types**: TypeScript interfaces for type safety across the application

The component follows React best practices with:

- Memoization for performance optimization
- Custom drag-and-drop implementation (no pre-built libraries)
- Full keyboard accessibility
- Responsive design for mobile, tablet, and desktop

## Features

### Core Features

- ✅ **Drag-and-drop tasks** - Move tasks between columns with smooth animations
- ✅ **Task creation/editing** - Create and edit tasks with full details
- ✅ **Task deletion** - Remove tasks with confirmation
- ✅ **Column management** - WIP limits, column options menu
- ✅ **Search and filtering** - Filter by assignee, priority, tags, or search text
- ✅ **Responsive design** - Optimized for mobile, tablet, and desktop
- ✅ **Keyboard accessibility** - Full keyboard navigation and drag support
- ✅ **ARIA labels** - Screen reader support

### Advanced Features

- Priority indicators with color coding
- Due date tracking with overdue highlighting
- Assignee avatars with initials
- Tag management (max 3 visible, with overflow indicator)
- Column collapse/expand
- WIP limit warnings
- Empty state messages

## Storybook Stories

### Default

Basic kanban board with sample data (4 columns).

### Empty State

Board with no tasks to demonstrate empty state handling.

### With Many Tasks

Board with 20+ tasks to test performance.

### Large Dataset

Board with 30+ tasks to demonstrate scalability.

### Interactive Demo

Fully functional drag-and-drop demonstration.

### Mobile View

Responsive layout optimized for mobile devices.

### Accessibility

Keyboard navigation demonstration with ARIA support.

### Interactive Playground

Playground with controls to modify columns and tasks.

## Technologies

- **React** ^18.0.0 - UI library
- **TypeScript** ^5.0.0 - Type safety
- **Tailwind CSS** ^3.0.0 - Styling
- **Vite** - Build tooling
- **Storybook** - Component documentation
- **date-fns** - Date manipulation
- **clsx** - Conditional class names
- **zustand** - State management (optional)
- **framer-motion** - Animations (optional)

## Performance

The component is optimized for performance:

- React.memo for expensive components
- Debounced search/filter inputs
- Efficient state management
- Optimized re-renders

Targets:

- Initial render < 300ms
- Drag response < 16ms frame time
- Search/filter < 100ms
- Handles 500+ tasks with no visible lag

## Accessibility

Fully compliant with WCAG 2.1 AA:

- **Keyboard Navigation**: Tab, Shift+Tab, Enter/Space, Escape, Arrow keys
- **ARIA Labels**: Proper roles, labels, and descriptions
- **Focus Management**: Visible focus indicators, proper focus trapping in modals
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Color Contrast**: Meets 4.5:1 ratio for text

## Usage

```tsx
import { KanbanBoard } from "./components/KanbanBoard/KanbanBoard";
import type {
  KanbanColumn,
  KanbanTask,
} from "./components/KanbanBoard/KanbanBoard.types";

const columns: KanbanColumn[] = [
  { id: "todo", title: "To Do", color: "#6b7280", taskIds: ["task-1"] },
  { id: "done", title: "Done", color: "#10b981", taskIds: [] },
];

const tasks: Record<string, KanbanTask> = {
  "task-1": {
    id: "task-1",
    title: "Example Task",
    status: "todo",
    priority: "high",
    createdAt: new Date(),
  },
};

function App() {
  return (
    <KanbanBoard
      columns={columns}
      tasks={tasks}
      onTaskMove={(taskId, fromColumn, toColumn, newIndex) => {
        // Handle task move
      }}
      onTaskCreate={(columnId, task) => {
        // Handle task creation
      }}
      onTaskUpdate={(taskId, updates) => {
        // Handle task update
      }}
      onTaskDelete={(taskId) => {
        // Handle task deletion
      }}
    />
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Run Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Build for production
npm run build
```

## Project Structure

```
kanban-component/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .storybook/
│   ├── main.ts
│   └── preview.ts
└── src/
    ├── components/
    │   ├── KanbanBoard/
    │   │   ├── KanbanBoard.tsx
    │   │   ├── KanbanBoard.stories.tsx
    │   │   ├── KanbanBoard.types.ts
    │   │   ├── KanbanColumn.tsx
    │   │   ├── KanbanCard.tsx
    │   │   └── TaskModal.tsx
    │   └── primitives/
    │       ├── Button.tsx
    │       ├── Modal.tsx
    │       └── Avatar.tsx
    ├── hooks/
    │   ├── useDragAndDrop.ts
    │   └── useKanbanBoard.ts
    ├── utils/
    │   ├── task.utils.ts
    │   ├── column.utils.ts
    │   └── common.utils.ts
    └── styles/
        └── globals.css
```

## License

MIT

## Contact

mdraushanji22@gmail.com
