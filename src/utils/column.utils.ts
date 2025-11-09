import type { KanbanColumn } from '../components/KanbanBoard/KanbanBoard.types';

export function reorderTasks(
  taskIds: string[],
  startIndex: number,
  endIndex: number
): string[] {
  const result = Array.from(taskIds);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function moveTaskBetweenColumns(
  sourceColumn: KanbanColumn,
  destinationColumn: KanbanColumn,
  taskId: string,
  sourceIndex: number,
  destinationIndex: number
): { source: KanbanColumn; destination: KanbanColumn } {
  const sourceTaskIds = Array.from(sourceColumn.taskIds);
  const destinationTaskIds = Array.from(destinationColumn.taskIds);
  
  // Remove from source
  sourceTaskIds.splice(sourceIndex, 1);
  
  // Add to destination
  destinationTaskIds.splice(destinationIndex, 0, taskId);
  
  return {
    source: { ...sourceColumn, taskIds: sourceTaskIds },
    destination: { ...destinationColumn, taskIds: destinationTaskIds },
  };
}

export function getColumnTaskCount(column: KanbanColumn): number {
  return column.taskIds.length;
}

export function isColumnAtLimit(column: KanbanColumn): boolean {
  if (!column.maxTasks) return false;
  return column.taskIds.length >= column.maxTasks;
}

export function isColumnNearLimit(column: KanbanColumn): boolean {
  if (!column.maxTasks) return false;
  return column.taskIds.length >= column.maxTasks * 0.8;
}

