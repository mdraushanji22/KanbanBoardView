import React from 'react';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';
import type { KanbanColumn, KanbanTask } from './components/KanbanBoard/KanbanBoard.types';

// Sample data for the Kanban board
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

// Handlers for board interactions
const handlers = {
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => {
    console.log('Task moved:', { taskId, fromColumn, toColumn, newIndex });
    // In a real app, you would update your state management here
  },
  onTaskCreate: (columnId: string, task: KanbanTask) => {
    console.log('Task created:', { columnId, task });
    // In a real app, you would update your state management here
  },
  onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => {
    console.log('Task updated:', { taskId, updates });
    // In a real app, you would update your state management here
  },
  onTaskDelete: (taskId: string) => {
    console.log('Task deleted:', taskId);
    // In a real app, you would update your state management here
  },
};

const App: React.FC = () => {
  return (
    <div className="App">
      <KanbanBoard 
        columns={sampleColumns} 
        tasks={sampleTasks} 
        {...handlers} 
      />
    </div>
  );
};

export default App;