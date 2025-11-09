import React from 'react';
import clsx from 'clsx';
import { Avatar } from '../primitives/Avatar';
import type { KanbanTask } from './KanbanBoard.types';
import { isOverdue, formatRelativeDate } from '../../utils/task.utils';

export interface KanbanCardProps {
  task: KanbanTask;
  onClick: () => void;
  isDragging?: boolean;
  isPlaceholder?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export const KanbanCard = React.memo<KanbanCardProps>(({
  task,
  onClick,
  isDragging = false,
  isPlaceholder = false,
  dragHandleProps = {},
}) => {
  // Get priority color for border
  const getPriorityBorderColor = (priority?: KanbanTask['priority']): string => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#d4d4d4';
    }
  };
  
  const priorityBorderColor = getPriorityBorderColor(task.priority);
  const overdue = task.dueDate ? isOverdue(task) : false;
  const visibleTags = task.tags?.slice(0, 3) || [];
  const remainingTags = task.tags ? Math.max(0, task.tags.length - 3) : 0;
  
  if (isPlaceholder) {
    return (
      <div className="h-24 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-xl" />
    );
  }
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Create a custom drag image with shadow and lift effect
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg) scale(1.05)';
    dragImage.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(dragImage, e.clientX - e.currentTarget.getBoundingClientRect().left, e.clientY - e.currentTarget.getBoundingClientRect().top);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    // Allow drag to work
    if (dragHandleProps.onDragStart) {
      dragHandleProps.onDragStart(e as React.DragEvent<HTMLElement>);
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Handle drag end
    if (dragHandleProps.onDragEnd) {
      dragHandleProps.onDragEnd(e as React.DragEvent<HTMLElement>);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Use a small delay to distinguish between click and drag
    const mouseDownTime = Date.now();
    const mouseDownPos = { x: e.clientX, y: e.clientY };
    let hasDragged = false;
    
    const handleMouseMove = () => {
      hasDragged = true;
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      const timeDiff = Date.now() - mouseDownTime;
      const moveDiff = Math.abs(upEvent.clientX - mouseDownPos.x) + Math.abs(upEvent.clientY - mouseDownPos.y);
      
      // If it's a quick click with minimal movement and no drag started, treat as click
      if (!hasDragged && timeDiff < 300 && moveDiff < 10) {
        onClick();
      }
      
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
      aria-grabbed={isDragging}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        // Keyboard drag: Space to pick up, arrows to move, Enter to drop
        // If not dragging, Space/Enter opens modal
        if (!isDragging) {
          if (e.key === 'Enter') {
            e.preventDefault();
            onClick();
          } else if (e.key === ' ') {
            // Space starts keyboard drag
            e.preventDefault();
            if (dragHandleProps.onKeyDown) {
              dragHandleProps.onKeyDown(e as any);
            }
          }
        }
      }}
      className={clsx(
        'relative bg-white rounded-xl p-4 shadow-sm border-l-4 border-t border-r border-b border-neutral-200',
        'hover:shadow-lg hover:border-primary-200 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isDragging 
          ? 'shadow-2xl scale-105 rotate-1 z-50 opacity-75 cursor-grabbing' 
          : 'cursor-grab active:cursor-grabbing',
        'group'
      )}
      style={{ borderLeftWidth: '4px', borderLeftColor: priorityBorderColor }}
    >
      {/* Drag indicator - visible on hover */}
      <div
        className="absolute top-2 right-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 flex items-center justify-center"
      >
        <svg className="w-4 h-4 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 5a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm6-12a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </div>
      
      <div className="flex flex-col gap-3 pr-2" data-no-drag>
        {/* Title */}
        <h3 className="font-semibold text-neutral-900 line-clamp-2 text-sm leading-tight">
          {task.title}
        </h3>
        
        {/* Description (if exists) */}
        {task.description && (
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        
        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-md border border-neutral-200"
              >
                {tag}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-neutral-50 text-neutral-500 rounded-md border border-neutral-200">
                +{remainingTags}
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2 flex-wrap">
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <Avatar name={task.assignee} size="sm" />
                <span className="text-xs text-neutral-600 truncate max-w-[80px]">
                  {task.assignee.split(' ')[0]}
                </span>
              </div>
            )}
            {task.dueDate && (
              <span
                className={clsx(
                  'text-xs px-2 py-1 rounded-md font-medium',
                  overdue
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-neutral-50 text-neutral-700 border border-neutral-200'
                )}
              >
                {formatRelativeDate(task.dueDate)}
              </span>
            )}
          </div>
          
          {/* Priority badge */}
          {task.priority && (
            <span
              className={clsx(
                'text-xs px-2 py-1 rounded-md font-medium capitalize',
                task.priority === 'urgent' && 'bg-red-50 text-red-700 border border-red-200',
                task.priority === 'high' && 'bg-orange-50 text-orange-700 border border-orange-200',
                task.priority === 'medium' && 'bg-yellow-50 text-yellow-700 border border-yellow-200',
                task.priority === 'low' && 'bg-green-50 text-green-700 border border-green-200'
              )}
            >
              {task.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

KanbanCard.displayName = 'KanbanCard';

