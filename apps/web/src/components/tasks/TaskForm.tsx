'use client';

import React, { useState, useEffect } from 'react';
import { Task, Section, Label, CreateTaskInput, UpdateTaskInput } from '@/types/api';
import { Button, Input, Modal, Select, SelectOption, cn } from '@todo/ui';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  _projectId: string;
  sections: Section[];
  labels: Label[];
  initialData?: Task | null;
  isLoading?: boolean;
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  _projectId,
  sections,
  labels,
  initialData,
  isLoading,
}: TaskFormProps) {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<CreateTaskInput | UpdateTaskInput>({
    title: '',
    description: '',
    sectionId: undefined,
    dueDate: undefined,
    assigneeId: undefined,
    priority: 4,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        sectionId: initialData.sectionId || undefined,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : undefined,
        assigneeId: initialData.assigneeId || undefined,
        priority: initialData.priority,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        sectionId: undefined,
        dueDate: undefined,
        assigneeId: undefined,
        priority: 4,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const submitData = { ...formData };
    // Convert empty strings to undefined for optional fields
    Object.keys(submitData).forEach((key) => {
      if (submitData[key as keyof typeof submitData] === '') {
        delete submitData[key as keyof typeof submitData];
      }
    });

    onSubmit(submitData);
  };

  const sectionOptions: SelectOption[] = [
    { value: '', label: 'No Section' },
    ...sections.map((s) => ({ value: s.id, label: s.name })),
  ];

  const priorityOptions: SelectOption[] = [
    { value: '1', label: 'P1 - Highest' },
    { value: '2', label: 'P2 - High' },
    { value: '3', label: 'P3 - Medium' },
    { value: '4', label: 'P4 - Normal' },
  ];

  const labelOptions: SelectOption[] = labels.map((l) => ({
    value: l.id,
    label: l.name,
    color: l.color,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700">
            Title <span className="text-error-main">*</span>
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="What needs to be done?"
            required
            autoFocus
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-neutral-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Add details..."
            rows={3}
            className={cn(
              'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm',
              'focus:ring-primary-500 focus:border-transparent focus:outline-none focus:ring-2',
              'placeholder:text-neutral-400'
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="sectionId" className="mb-1 block text-sm font-medium text-neutral-700">
              Section
            </label>
            <Select
              id="sectionId"
              value={formData.sectionId || ''}
              onChange={(e) => handleChange('sectionId', e.target.value || undefined)}
              options={sectionOptions}
              placeholder="Select section"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="priority" className="mb-1 block text-sm font-medium text-neutral-700">
              Priority
            </label>
            <Select
              id="priority"
              value={String(formData.priority || 4)}
              onChange={(e) => handleChange('priority', Number(e.target.value))}
              options={priorityOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-neutral-700">
              Due Date
            </label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value || undefined)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="labels" className="mb-1 block text-sm font-medium text-neutral-700">
              Labels
            </label>
            <Select
              id="labels"
              value={[]}
              onChange={() => {}} // Multi-select would need custom implementation
              options={labelOptions}
              placeholder="Select labels"
              className="w-full"
              // Note: This is a single select for simplicity
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!formData.title?.trim() || isLoading}
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskForm;
