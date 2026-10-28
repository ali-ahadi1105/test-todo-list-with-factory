import React, { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  width?: string;
  collapsedWidth?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onToggleCollapse,
  className,
  width = 'w-64',
  collapsedWidth = 'w-20',
  logo,
  footer,
  activeItem,
  onItemClick,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderItem = (item: SidebarItem, depth = 0) => {
    const isActive = item.id === activeItem;
    const hasChildren = item.children && item.children.length > 0;
    const [isExpanded, setIsExpanded] = useState(!collapsed || isActive);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (hasChildren && !collapsed) {
        setIsExpanded(!isExpanded);
      } else if (!item.disabled) {
        onItemClick?.(item);
        item.onClick?.();
        if (window.innerWidth < 1024) {
          setIsMobileOpen(false);
        }
      }
    };

    if (collapsed && depth > 0) return null;

    return (
      <div key={item.id}>
        <button
          onClick={handleClick}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
            depth > 0 && 'pl-8'
          )}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-current={isActive ? 'page' : undefined}
        >
          {item.icon && (
            <span className={cn('flex-shrink-0 w-5 h-5', collapsed && 'mx-auto')}>
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-sm font-medium">
              {item.label}
            </span>
          )}
          {!collapsed && item.badge && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              {item.badge}
            </span>
          )}
          {!collapsed && hasChildren && (
            <svg
              className={cn(
                'flex-shrink-0 w-4 h-4 text-neutral-400 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
        {!collapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1200] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-[1250] bg-white border-r border-neutral-200',
          'flex flex-col transition-all duration-300 ease-in-out',
          'transform lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? collapsedWidth : width,
          className
        )}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-neutral-200', collapsed && 'justify-center')}>
          {logo && !collapsed && <span className="flex-1">{logo}</span>}
          {logo && collapsed && <span className="text-center">{logo}</span>}
          {onToggleCollapse && !collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="text-neutral-400 hover:text-neutral-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
          {items.map((item) => renderItem(item))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className={cn('p-4 border-t border-neutral-200', collapsed && 'justify-center')}>
            {!collapsed ? footer : <div className="text-center">{footer}</div>}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;