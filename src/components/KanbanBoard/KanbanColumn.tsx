import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Button } from '../primitives/Button';
import { KanbanCard } from './KanbanCard';
import type { KanbanColumn as KanbanColumnType, KanbanTask } from './KanbanBoard.types';
import { getColumnTaskCount, isColumnAtLimit, isColumnNearLimit } from '../../utils/column.utils';

export interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
  onAddTask: () => void;
  onTaskDragStart?: (taskId: string, index: number, element: HTMLElement, event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void;
  onTaskDragEnd?: (taskId: string, newIndex: number) => void;
  onTaskDragOver?: (taskId: string, index: number) => void;
  dragState?: {
    taskId: string | null;
    columnId: string | null;
    currentIndex: number;
    isDragging: boolean;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const KanbanColumn = React.memo<KanbanColumnProps>(({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  dragState,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  
  const taskCount = getColumnTaskCount(column);
  const atLimit = isColumnAtLimit(column);
  const nearLimit = isColumnNearLimit(column);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);
  
  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const tasksContainerRef = useRef<HTMLDivElement>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState?.isDragging || !dragState.taskId || !tasksContainerRef.current) return;
    
    const rect = tasksContainerRef.current.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Calculate which position to insert at based on mouse Y position
    let insertIndex = tasks.length;
    const isSameColumn = dragState.columnId === column.id;
    const sourceTaskIndex = isSameColumn ? tasks.findIndex(t => t.id === dragState.taskId) : -1;
    
    // Find which task the mouse is over by checking each task's position
    for (let i = 0; i < tasks.length; i++) {
      // Skip the dragged task itself
      if (isSameColumn && tasks[i].id === dragState.taskId) continue;
      
      // Find the task element in the DOM
      const taskElements = tasksContainerRef.current.querySelectorAll('[data-task-id]');
      const taskElement = Array.from(taskElements).find(el => 
        (el as HTMLElement).dataset.taskId === tasks[i].id
      ) as HTMLElement | undefined;
      
      if (taskElement) {
        const taskRect = taskElement.getBoundingClientRect();
        const taskTop = taskRect.top - rect.top;
        const taskHeight = taskRect.height;
        const taskCenter = taskTop + taskHeight / 2;
        
        // If mouse is above the center of this task, insert before it
        if (mouseY < taskCenter) {
          insertIndex = i;
          break;
        }
      }
    }
    
    // Adjust index for same-column drags (account for removed task)
    if (isSameColumn && sourceTaskIndex !== -1) {
      if (sourceTaskIndex < insertIndex) {
        insertIndex = insertIndex - 1;
      }
    }
    
    // Only update if index changed
    if (insertIndex !== hoverIndex) {
      setHoverIndex(insertIndex);
      // Update drag state with new position
      onTaskDragOver?.(dragState.taskId, insertIndex);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dragState?.taskId) {
      setHoverIndex(-1);
      return;
    }
    
    // Check if drop is valid (within column bounds)
    const dropIndex = hoverIndex >= 0 ? hoverIndex : tasks.length;
    const isValidDrop = dragState.columnId === column.id || true; // Always valid for now
    
    setHoverIndex(-1);
    
    if (isValidDrop) {
      // Valid drop - animate card into position
      onTaskDragEnd?.(dragState.taskId, dropIndex);
    } else {
      // Invalid drop - will be handled by parent to animate back
      setHoverIndex(-1);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear hover if actually leaving the column area
    if (!columnRef.current?.contains(e.relatedTarget as Node)) {
      setHoverIndex(-1);
    }
  };
  
  const getDragHandleProps = (taskId: string, index: number) => {
    return {
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        e.stopPropagation();
        const element = e.currentTarget.closest('[data-task-id]')?.querySelector('.group') as HTMLElement || e.currentTarget as HTMLElement;
        onTaskDragStart?.(taskId, index, element, e);
      },
      onDragEnd: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setHoverIndex(-1);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        // Keyboard drag support: Space to pick up, arrows to move, Enter to drop, Escape to cancel
        if (e.key === ' ') {
          e.preventDefault();
          const element = e.currentTarget.closest('[data-task-id]')?.querySelector('.group') as HTMLElement || e.currentTarget as HTMLElement;
          onTaskDragStart?.(taskId, index, element, e);
        } else if (e.key === 'ArrowUp' && index > 0) {
          e.preventDefault();
          onTaskDragOver?.(taskId, index - 1);
        } else if (e.key === 'ArrowDown' && index < tasks.length - 1) {
          e.preventDefault();
          onTaskDragOver?.(taskId, index + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          // Move to adjacent column (handled by parent)
          onTaskDragOver?.(taskId, index);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          onTaskDragEnd?.(taskId, index);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setHoverIndex(-1);
          // Cancel drag (handled by parent)
        }
      },
    };
  };
  
  return (
    <div
      ref={columnRef}
      className={clsx(
        'flex flex-col bg-neutral-50 rounded-xl border-2 transition-all duration-200',
        'min-w-[280px] max-w-[320px] h-full',
        dragState?.isDragging && dragState.columnId === column.id
          ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50/50'
          : dragState?.isDragging
          ? 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50/30'
          : 'border-neutral-200'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      role="region"
      aria-label={`${column.title} column with ${taskCount} tasks`}
    >
      {/* Header */}
      <div
        className={clsx(
          'sticky top-0 z-10 flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50 rounded-t-xl',
          atLimit && 'bg-red-50',
          nearLimit && !atLimit && 'bg-yellow-50'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
            aria-hidden="true"
          />
          <h2 className="font-semibold text-neutral-900 truncate">{column.title}</h2>
          <span className="text-sm text-neutral-600">({taskCount})</span>
          {column.maxTasks && (
            <span className="text-xs text-neutral-500">/ {column.maxTasks}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-neutral-200 rounded"
              aria-label={isCollapsed ? 'Expand column' : 'Collapse column'}
            >
              <svg
                className={clsx('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 hover:bg-neutral-200 rounded"
              aria-label="Column options"
              aria-expanded={isMenuOpen}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // TODO: Implement rename
                  }}
                >
                  Rename Column
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // TODO: Implement WIP limit
                  }}
                >
                  Set WIP Limit
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // TODO: Implement delete
                  }}
                >
                  Delete Column
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tasks */}
      {!isCollapsed && (
        <div 
          ref={tasksContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-500">
              {dragState?.isDragging && dragState.columnId === column.id ? (
                <div className="py-4">
                  <div className="h-24 bg-primary-100 border-2 border-dashed border-primary-300 rounded-xl" />
                </div>
              ) : (
                'No tasks in this column'
              )}
            </div>
          ) : (
            <>
              {tasks.map((task, index) => {
                const isDragging = dragState?.taskId === task.id && dragState.isDragging;
                const isSameColumn = dragState?.columnId === column.id;
                
                // Show placeholder before this task if:
                // 1. Dragging and this is the target position
                // 2. Not dragging the current task
                const showPlaceholderBefore = dragState?.isDragging && 
                                            dragState.taskId !== task.id &&
                                            ((isSameColumn && dragState.currentIndex === index) ||
                                             (!isSameColumn && hoverIndex === index));
                
                return (
                  <React.Fragment key={task.id}>
                    {showPlaceholderBefore && (
                      <div 
                        className="py-1 animate-in fade-in duration-200"
                        style={{ animation: 'fadeIn 0.2s ease-in' }}
                      >
                        <div className="h-24 bg-primary-100 border-2 border-dashed border-primary-400 rounded-xl shadow-sm" />
                      </div>
                    )}
                    <div
                      data-task-id={task.id}
                      className={clsx(
                        'transition-all duration-200',
                        isDragging && 'opacity-20 scale-95 pointer-events-none'
                      )}
                    >
                      <KanbanCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                        isDragging={isDragging}
                        dragHandleProps={getDragHandleProps(task.id, index)}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
              {/* Show placeholder at the end if dragging to end of column */}
              {dragState?.isDragging && 
               dragState.taskId && 
               dragState.columnId === column.id && 
               dragState.currentIndex >= tasks.length && (
                <div className="py-1 animate-in fade-in duration-200">
                  <div className="h-24 bg-primary-100 border-2 border-dashed border-primary-400 rounded-xl shadow-sm" />
                </div>
              )}
              {dragState?.isDragging && 
               dragState.taskId && 
               dragState.columnId !== column.id && 
               hoverIndex >= tasks.length && (
                <div className="py-1 animate-in fade-in duration-200">
                  <div className="h-24 bg-primary-100 border-2 border-dashed border-primary-400 rounded-xl shadow-sm" />
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Add Task Button */}
      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            className="w-full"
          >
            + Add Task
          </Button>
        </div>
      )}
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

