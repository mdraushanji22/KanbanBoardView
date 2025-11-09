import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from './KanbanBoard';
import type { KanbanColumn, KanbanTask } from './KanbanBoard.types';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Components/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A fully functional Kanban Board component with drag-and-drop, task management, and filtering capabilities.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

// Sample data
const sampleColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: ['task-1', 'task-2'], maxTasks: 10 },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6', taskIds: ['task-3'], maxTasks: 5 },
  { id: 'review', title: 'Review', color: '#f59e0b', taskIds: [], maxTasks: 3 },
  { id: 'done', title: 'Done', color: '#10b981', taskIds: ['task-4', 'task-5'] },
];

const sampleTasks: Record<string, KanbanTask> = {
  'task-1': {
    id: 'task-1',
    title: 'Implement drag and drop',
    description: 'Add D&D functionality to kanban cards',
    status: 'todo',
    priority: 'high',
    assignee: 'John Doe',
    tags: ['frontend', 'feature'],
    createdAt: new Date(2024, 0, 10),
    dueDate: new Date(2024, 0, 20),
  },
  'task-2': {
    id: 'task-2',
    title: 'Design task modal',
    description: 'Create modal for editing task details',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jane Smith',
    tags: ['design', 'ui'],
    createdAt: new Date(2024, 0, 11),
    dueDate: new Date(2024, 0, 18),
  },
  'task-3': {
    id: 'task-3',
    title: 'Setup TypeScript',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'John Doe',
    tags: ['setup', 'typescript'],
    createdAt: new Date(2024, 0, 9),
  },
  'task-4': {
    id: 'task-4',
    title: 'Create project structure',
    description: 'Setup folder structure and initial files',
    status: 'done',
    priority: 'low',
    assignee: 'Jane Smith',
    tags: ['setup'],
    createdAt: new Date(2024, 0, 8),
    dueDate: new Date(2024, 0, 9),
  },
  'task-5': {
    id: 'task-5',
    title: 'Install dependencies',
    status: 'done',
    priority: 'low',
    assignee: 'John Doe',
    tags: ['setup'],
    createdAt: new Date(2024, 0, 8),
  },
};

// Default story handlers
const defaultHandlers = {
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => {
    console.log('Task moved:', { taskId, fromColumn, toColumn, newIndex });
  },
  onTaskCreate: (columnId: string, task: KanbanTask) => {
    console.log('Task created:', { columnId, task });
  },
  onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => {
    console.log('Task updated:', { taskId, updates });
  },
  onTaskDelete: (taskId: string) => {
    console.log('Task deleted:', taskId);
  },
};

export const Default: Story = {
  args: {
    columns: sampleColumns,
    tasks: sampleTasks,
    ...defaultHandlers,
  },
};

export const EmptyState: Story = {
  args: {
    columns: [
      { id: 'todo', title: 'To Do', color: '#6b7280', taskIds: [] },
      { id: 'in-progress', title: 'In Progress', color: '#3b82f6', taskIds: [] },
      { id: 'done', title: 'Done', color: '#10b981', taskIds: [] },
    ],
    tasks: {},
    ...defaultHandlers,
  },
};

// Generate many tasks for large dataset
const generateManyTasks = (count: number): Record<string, KanbanTask> => {
  const tasks: Record<string, KanbanTask> = {};
  const priorities: KanbanTask['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const assignees = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'];
  const tags = ['frontend', 'backend', 'design', 'testing', 'documentation', 'bugfix', 'feature'];
  
  for (let i = 1; i <= count; i++) {
    const columnIndex = Math.floor(Math.random() * sampleColumns.length);
    const column = sampleColumns[columnIndex];
    
    tasks[`task-${i}`] = {
      id: `task-${i}`,
      title: `Task ${i}: ${['Implement', 'Design', 'Fix', 'Refactor', 'Test', 'Document'][Math.floor(Math.random() * 6)]} feature ${i}`,
      description: `Description for task ${i}. This is a longer description that might span multiple lines.`,
      status: column.id,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignee: assignees[Math.floor(Math.random() * assignees.length)],
      tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1),
      dueDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 15),
    };
  }
  
  return tasks;
};

const manyTasks = generateManyTasks(20);
const manyTaskColumns: KanbanColumn[] = sampleColumns.map(col => ({
  ...col,
  taskIds: Object.values(manyTasks)
    .filter(task => task.status === col.id)
    .map(task => task.id),
}));

export const WithManyTasks: Story = {
  args: {
    columns: manyTaskColumns,
    tasks: manyTasks,
    ...defaultHandlers,
  },
};

const largeDatasetTasks = generateManyTasks(30);
const largeDatasetColumns: KanbanColumn[] = sampleColumns.map(col => ({
  ...col,
  taskIds: Object.values(largeDatasetTasks)
    .filter(task => task.status === col.id)
    .map(task => task.id),
}));

export const LargeDataset: Story = {
  args: {
    columns: largeDatasetColumns,
    tasks: largeDatasetTasks,
    ...defaultHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Kanban board with 30+ tasks to demonstrate performance with larger datasets.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    columns: sampleColumns,
    tasks: sampleTasks,
    ...defaultHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive demo with drag-and-drop functionality. Try dragging tasks between columns!',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    columns: sampleColumns,
    tasks: sampleTasks,
    ...defaultHandlers,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Responsive layout optimized for mobile devices. Columns stack vertically on small screens.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    columns: sampleColumns,
    tasks: sampleTasks,
    ...defaultHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: 'Keyboard navigation demonstration. Use Tab to navigate, Space to pick up tasks, Arrow keys to move, Enter to drop.',
      },
    },
  },
};

export const InteractivePlayground: Story = {
  args: {
    columns: sampleColumns,
    tasks: sampleTasks,
    ...defaultHandlers,
  },
  argTypes: {
    columns: {
      control: 'object',
      description: 'Array of column configurations',
    },
    tasks: {
      control: 'object',
      description: 'Object mapping task IDs to task data',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground with controls to modify columns and tasks.',
      },
    },
  },
};

