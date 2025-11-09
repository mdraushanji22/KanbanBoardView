import type { KanbanTask } from '../components/KanbanBoard/KanbanBoard.types';

export function isOverdue(task: KanbanTask): boolean {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export function getPriorityColor(priority?: KanbanTask['priority']): string {
  switch (priority) {
    case 'urgent':
      return 'border-red-500';
    case 'high':
      return 'border-orange-500';
    case 'medium':
      return 'border-yellow-500';
    case 'low':
      return 'border-green-500';
    default:
      return 'border-neutral-300';
  }
}

export function getPriorityBgColor(priority?: KanbanTask['priority']): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 text-red-700';
    case 'high':
      return 'bg-orange-50 text-orange-700';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700';
    case 'low':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-neutral-50 text-neutral-700';
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(date);
}

