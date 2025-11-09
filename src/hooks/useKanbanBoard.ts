import { useState, useCallback } from 'react';
import type { KanbanTask, KanbanColumn, KanbanViewProps } from '../components/KanbanBoard/KanbanBoard.types';
import { reorderTasks, moveTaskBetweenColumns } from '../utils/column.utils';

export function useKanbanBoard(initialProps: KanbanViewProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialProps.columns);
  const [tasks, setTasks] = useState<Record<string, KanbanTask>>(initialProps.tasks);
  
  const handleTaskMove = useCallback((
    taskId: string,
    fromColumn: string,
    toColumn: string,
    newIndex: number
  ) => {
    setColumns(prevColumns => {
      const sourceColumn = prevColumns.find(col => col.id === fromColumn);
      const destinationColumn = prevColumns.find(col => col.id === toColumn);
      
      if (!sourceColumn || !destinationColumn) return prevColumns;
      
      if (fromColumn === toColumn) {
        // Reorder within same column
        const newTaskIds = reorderTasks(
          sourceColumn.taskIds,
          sourceColumn.taskIds.indexOf(taskId),
          newIndex
        );
        
        return prevColumns.map(col =>
          col.id === fromColumn
            ? { ...col, taskIds: newTaskIds }
            : col
        );
      } else {
        // Move between columns
        const { source, destination } = moveTaskBetweenColumns(
          sourceColumn,
          destinationColumn,
          taskId,
          sourceColumn.taskIds.indexOf(taskId),
          newIndex
        );
        
        return prevColumns.map(col => {
          if (col.id === fromColumn) return source;
          if (col.id === toColumn) return destination;
          return col;
        });
      }
    });
    
    // Update task status
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (task && task.status !== toColumn) {
        return {
          ...prevTasks,
          [taskId]: { ...task, status: toColumn },
        };
      }
      return prevTasks;
    });
    
    initialProps.onTaskMove(taskId, fromColumn, toColumn, newIndex);
  }, [initialProps]);
  
  const handleTaskCreate = useCallback((columnId: string, task: KanbanTask) => {
    setTasks(prev => ({ ...prev, [task.id]: task }));
    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, taskIds: [...col.taskIds, task.id] }
        : col
    ));
    initialProps.onTaskCreate(columnId, task);
  }, [initialProps]);
  
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<KanbanTask>) => {
    setTasks(prev => {
      const task = prev[taskId];
      if (!task) return prev;
      
      const updatedTask = { ...task, ...updates };
      
      // If status changed, move task between columns
      if (updates.status && updates.status !== task.status) {
        setColumns(prevColumns => {
          const oldColumn = prevColumns.find(col => col.taskIds.includes(taskId));
          const newColumn = prevColumns.find(col => col.id === updates.status);
          
          if (!oldColumn || !newColumn) return prevColumns;
          
          return prevColumns.map(col => {
            if (col.id === oldColumn.id) {
              return {
                ...col,
                taskIds: col.taskIds.filter(id => id !== taskId),
              };
            }
            if (col.id === newColumn.id) {
              return {
                ...col,
                taskIds: [...col.taskIds, taskId],
              };
            }
            return col;
          });
        });
      }
      
      return { ...prev, [taskId]: updatedTask };
    });
    
    initialProps.onTaskUpdate(taskId, updates);
  }, [initialProps]);
  
  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks(prev => {
      const { [taskId]: deleted, ...rest } = prev;
      return rest;
    });
    
    setColumns(prev => prev.map(col => ({
      ...col,
      taskIds: col.taskIds.filter(id => id !== taskId),
    })));
    
    initialProps.onTaskDelete(taskId);
  }, [initialProps]);
  
  const getTasksForColumn = useCallback((columnId: string): KanbanTask[] => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return [];
    
    return column.taskIds
      .map(id => tasks[id])
      .filter((task): task is KanbanTask => task !== undefined);
  }, [columns, tasks]);
  
  return {
    columns,
    tasks,
    handleTaskMove,
    handleTaskCreate,
    handleTaskUpdate,
    handleTaskDelete,
    getTasksForColumn,
  };
}

