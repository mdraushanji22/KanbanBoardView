import { useState, useCallback, useRef } from 'react';
import type { DragState } from '../components/KanbanBoard/KanbanBoard.types';

export interface UseDragAndDropOptions {
  onDragStart?: (taskId: string, columnId: string, index: number) => void;
  onDragEnd?: (taskId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  onDragMove?: (taskId: string, columnId: string, index: number) => void;
  onDragCancel?: (taskId: string) => void;
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    taskId: null,
    columnId: null,
    startIndex: -1,
    currentIndex: -1,
    isDragging: false,
  });
  
  const dragElementRef = useRef<HTMLElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const startDrag = useCallback((
    taskId: string,
    columnId: string,
    index: number,
    element: HTMLElement,
    event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent
  ) => {
    const isKeyboardDrag = 'key' in event;
    
    setDragState({
      taskId,
      columnId,
      startIndex: index,
      currentIndex: index,
      isDragging: true,
      isKeyboardDrag,
      isValidDrop: true,
    });
    
    dragElementRef.current = element;
    
    if ('clientX' in event && 'clientY' in event) {
      const rect = element.getBoundingClientRect();
      dragOffsetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
    
    options.onDragStart?.(taskId, columnId, index);
  }, [options]);
  
  const endDrag = useCallback((
    taskId: string,
    fromColumn: string,
    toColumn: string,
    newIndex: number
  ) => {
    const wasSuccessful = newIndex >= 0;
    
    if (!wasSuccessful) {
      // Invalid drop - animate back to original position
      options.onDragCancel?.(taskId);
    }
    
    setDragState({
      taskId: null,
      columnId: null,
      startIndex: -1,
      currentIndex: -1,
      isDragging: false,
      isKeyboardDrag: false,
      isValidDrop: true,
    });
    
    dragElementRef.current = null;
    
    if (wasSuccessful) {
      options.onDragEnd?.(taskId, fromColumn, toColumn, newIndex);
    }
  }, [options]);
  
  const updateDragPosition = useCallback((
    taskId: string,
    columnId: string,
    index: number
  ) => {
    setDragState(prev => ({
      ...prev,
      columnId,
      currentIndex: index,
    }));
    
    options.onDragMove?.(taskId, columnId, index);
  }, [options]);
  
  const cancelDrag = useCallback(() => {
    const taskId = dragState.taskId;
    
    setDragState({
      taskId: null,
      columnId: null,
      startIndex: -1,
      currentIndex: -1,
      isDragging: false,
      isKeyboardDrag: false,
      isValidDrop: true,
    });
    
    dragElementRef.current = null;
    
    if (taskId) {
      options.onDragCancel?.(taskId);
    }
  }, [dragState.taskId, options]);
  
  return {
    dragState,
    startDrag,
    endDrag,
    updateDragPosition,
    cancelDrag,
  };
}

