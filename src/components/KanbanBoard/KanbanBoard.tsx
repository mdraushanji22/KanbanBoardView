import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import type { KanbanViewProps, KanbanTask } from './KanbanBoard.types';

export const KanbanBoard = React.memo<KanbanViewProps>((props) => {
  const {
    columns,
    tasks,
    handleTaskMove,
    handleTaskCreate,
    handleTaskUpdate,
    handleTaskDelete,
    getTasksForColumn,
  } = useKanbanBoard(props);
  
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<KanbanTask['priority'] | ''>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  
  const {
    dragState,
    startDrag,
    endDrag,
    updateDragPosition,
    cancelDrag,
  } = useDragAndDrop({
    onDragEnd: (taskId, fromColumn, toColumn, newIndex) => {
      handleTaskMove(taskId, fromColumn, toColumn, newIndex);
    },
    onDragCancel: (_taskId) => {
      // Invalid drop - task will animate back to original position
      // The state will revert automatically since we didn't call handleTaskMove
    },
  });
  
  // Handle keyboard navigation for drag
  useEffect(() => {
    if (!dragState.isDragging || !dragState.isKeyboardDrag) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrag();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Move to adjacent column
        const currentColumnIndex = columns.findIndex(col => col.id === dragState.columnId);
        if (currentColumnIndex !== -1) {
          const newColumnIndex = e.key === 'ArrowLeft' 
            ? Math.max(0, currentColumnIndex - 1)
            : Math.min(columns.length - 1, currentColumnIndex + 1);
          const newColumn = columns[newColumnIndex];
          if (newColumn && newColumn.id !== dragState.columnId) {
            updateDragPosition(dragState.taskId!, newColumn.id, 0);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dragState, columns, cancelDrag, updateDragPosition]);
  
  const handleTaskClick = useCallback((task: KanbanTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);
  
  const handleCreateTask = useCallback((columnId: string) => {
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      description: '',
      status: columnId,
      priority: 'medium',
      createdAt: new Date(),
    };
    
    setSelectedTask(newTask);
    setIsModalOpen(true);
    
    // Will be created when saved in modal
    handleTaskCreate(columnId, newTask);
  }, [handleTaskCreate]);
  
  const handleSaveTask = useCallback((taskId: string, updates: Partial<KanbanTask>) => {
    handleTaskUpdate(taskId, updates);
    handleCloseModal();
  }, [handleTaskUpdate, handleCloseModal]);
  
  const handleDeleteTask = useCallback((taskId: string) => {
    handleTaskDelete(taskId);
    handleCloseModal();
  }, [handleTaskDelete, handleCloseModal]);
  
  const handleToggleCollapse = useCallback((columnId: string) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  }, []);
  
  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = { ...tasks };
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        )
      );
    }
    
    if (filterAssignee) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) =>
          task.assignee?.toLowerCase().includes(filterAssignee.toLowerCase())
        )
      );
    }
    
    if (filterPriority) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) => task.priority === filterPriority)
      );
    }
    
    if (filterTag) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) =>
          task.tags?.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
        )
      );
    }
    
    return filtered;
  }, [tasks, searchQuery, filterAssignee, filterPriority, filterTag]);
  
  // Get all unique assignees and tags for filters
  const allAssignees = useMemo(() => {
    const assignees = new Set<string>();
    Object.values(tasks).forEach(task => {
      if (task.assignee) assignees.add(task.assignee);
    });
    return Array.from(assignees).sort();
  }, [tasks]);
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(tasks).forEach(task => {
      task.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tasks]);
  
  const handleTaskDragStart = useCallback((
    taskId: string,
    index: number,
    element: HTMLElement,
    event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent
  ) => {
    const task = tasks[taskId];
    if (!task) return;
    
    const column = columns.find(col => col.id === task.status);
    if (!column) return;
    
    startDrag(taskId, column.id, index, element, event);
  }, [tasks, columns, startDrag]);
  
  const handleTaskDragEnd = useCallback((_taskId: string, newIndex: number) => {
    if (!dragState.taskId) {
      cancelDrag();
      return;
    }
    
    const sourceTask = tasks[dragState.taskId];
    if (!sourceTask) {
      cancelDrag();
      return;
    }
    
    const sourceColumn = columns.find(col => col.id === sourceTask.status);
    // Use the column from dragState if available, otherwise use source column
    const targetColumn = dragState.columnId 
      ? columns.find(col => col.id === dragState.columnId)
      : sourceColumn;
    
    if (!sourceColumn || !targetColumn) {
      cancelDrag();
      return;
    }
    
    // Ensure newIndex is valid
    const validIndex = Math.max(0, Math.min(newIndex, targetColumn.taskIds.length));
    
    endDrag(
      dragState.taskId,
      sourceColumn.id,
      targetColumn.id,
      validIndex
    );
  }, [dragState, tasks, columns, endDrag, cancelDrag]);
  
  const handleTaskDragOver = useCallback((_taskId: string, index: number) => {
    if (!dragState.taskId) return;
    
    const task = tasks[dragState.taskId];
    if (!task) return;
    
    // Get the target column - either the column being hovered over or the source column
    const sourceColumn = columns.find(col => col.id === task.status);
    const targetColumn = dragState.columnId 
      ? columns.find(col => col.id === dragState.columnId)
      : sourceColumn;
    
    if (!targetColumn) return;
    
    // Update drag position to the target column and index
    updateDragPosition(dragState.taskId, targetColumn.id, index);
  }, [dragState, tasks, columns, updateDragPosition]);
  
  return (
    <div className="flex flex-col h-screen w-full bg-neutral-100">
      {/* Header with Search and Filters */}
      <div className="bg-white border-b border-neutral-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Search tasks"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter by assignee"
            >
              <option value="">All Assignees</option>
              {allAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as KanbanTask['priority'] | '')}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter by tag"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            
            {(searchQuery || filterAssignee || filterPriority || filterTag) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterAssignee('');
                  setFilterPriority('');
                  setFilterTag('');
                }}
                className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4" style={{ minHeight: '600px' }}>
        <div
          className="flex gap-4 h-full"
          style={{
            scrollSnapType: 'x mandatory',
            minHeight: '600px',
          }}
        >
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.id)
              .filter(task => filteredTasks[task.id])
              .map(task => filteredTasks[task.id])
              .filter((task): task is KanbanTask => task !== undefined);
            
            return (
              <div
                key={column.id}
                className="flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <KanbanColumn
                  column={column}
                  tasks={columnTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={() => handleCreateTask(column.id)}
                  onTaskDragStart={handleTaskDragStart}
                  onTaskDragEnd={handleTaskDragEnd}
                  onTaskDragOver={handleTaskDragOver}
                  dragState={dragState}
                  isCollapsed={collapsedColumns.has(column.id)}
                  onToggleCollapse={() => handleToggleCollapse(column.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={tasks[selectedTask.id] || selectedTask}
          columns={columns}
          onUpdate={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

