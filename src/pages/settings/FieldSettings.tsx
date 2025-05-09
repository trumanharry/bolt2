import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  X, 
  Check,
  GripVertical,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useEntityStore } from '../../stores/entityStore';

interface FieldFormData {
  name: string;
  label: string;
  type: string;
  is_required: boolean;
  is_unique: boolean;
  default_value?: string;
  options?: string;
}

const FieldSettings: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const { 
    entities, 
    fields,
    fetchEntities,
    fetchFields,
    createField,
    updateField,
    deleteField
  } = useEntityStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FieldFormData>();
  
  const selectedType = watch('type');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      await fetchEntities();
      
      if (entityId) {
        await fetchFields(entityId);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [entityId, fetchEntities, fetchFields]);
  
  const entity = entities.find(e => e.id === entityId);
  const entityFields = entityId ? fields[entityId] || [] : [];
  
  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date/Time' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'relation', label: 'Relation' },
  ];
  
  const handleCreateField = async (data: FieldFormData) => {
    if (!entityId) return;
    
    try {
      // Convert name to lowercase and replace spaces with underscores
      const formattedName = data.name.toLowerCase().replace(/\s+/g, '_');
      
      // Process options if it's a select or radio type
      let processedOptions = undefined;
      if (['select', 'radio'].includes(data.type) && data.options) {
        // Convert comma-separated list to array of objects
        processedOptions = data.options.split(',').map(option => {
          const trimmed = option.trim();
          return { 
            label: trimmed,
            value: trimmed.toLowerCase().replace(/\s+/g, '_') 
          };
        });
      }
      
      const newField = await createField({
        entity_id: entityId,
        name: formattedName,
        label: data.label,
        type: data.type,
        is_required: data.is_required || false,
        is_unique: data.is_unique || false,
        default_value: data.default_value || null,
        options: processedOptions,
        display_order: entityFields.length
      });
      
      if (newField) {
        toast.success('Field created successfully');
        setShowCreateForm(false);
        reset();
      } else {
        toast.error('Failed to create field');
      }
    } catch (error) {
      toast.error('Error creating field');
    }
  };
  
  const handleUpdateField = async (data: FieldFormData) => {
    if (!entityId || !editingFieldId) return;
    
    try {
      // Convert name to lowercase and replace spaces with underscores
      const formattedName = data.name.toLowerCase().replace(/\s+/g, '_');
      
      // Process options if it's a select or radio type
      let processedOptions = undefined;
      if (['select', 'radio'].includes(data.type) && data.options) {
        // Convert comma-separated list to array of objects
        processedOptions = data.options.split(',').map(option => {
          const trimmed = option.trim();
          return { 
            label: trimmed,
            value: trimmed.toLowerCase().replace(/\s+/g, '_') 
          };
        });
      }
      
      const updatedField = await updateField(editingFieldId, {
        name: formattedName,
        label: data.label,
        type: data.type,
        is_required: data.is_required || false,
        is_unique: data.is_unique || false,
        default_value: data.default_value || null,
        options: processedOptions
      });
      
      if (updatedField) {
        toast.success('Field updated successfully');
        setEditingFieldId(null);
        reset();
      } else {
        toast.error('Failed to update field');
      }
    } catch (error) {
      toast.error('Error updating field');
    }
  };
  
  const handleDeleteField = async (id: string) => {
    try {
      const success = await deleteField(id);
      
      if (success) {
        toast.success('Field deleted successfully');
        setDeleteConfirm(null);
      } else {
        toast.error('Failed to delete field');
      }
    } catch (error) {
      toast.error('Error deleting field');
    }
  };
  
  const handleStartEdit = (fieldId: string) => {
    const field = entityFields.find(f => f.id === fieldId);
    
    if (field) {
      let options;
      if (field.options && Array.isArray(field.options)) {
        options = field.options.map((opt: any) => opt.label).join(', ');
      }
      
      reset({
        name: field.name,
        label: field.label,
        type: field.type,
        is_required: field.is_required,
        is_unique: field.is_unique,
        default_value: field.default_value as string,
        options
      });
      
      setEditingFieldId(fieldId);
    }
  };
  
  if (!entityId || !entity) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Entity not found
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/settings/entities')}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Entities
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fields for {entity.label}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage fields for this entity
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreateForm(true)}
          leftIcon={<Plus size={16} />}
          disabled={showCreateForm}
        >
          Create Field
        </Button>
      </div>
      
      {showCreateForm && (
        <Card title="Create New Field">
          <form onSubmit={handleSubmit(handleCreateField)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                id="name"
                label="API Name"
                placeholder="e.g. phone_number (lowercase, no spaces)"
                helperText="This will be used in the API"
                error={errors.name?.message}
                fullWidth
                {...register('name', {
                  required: 'API Name is required',
                  pattern: {
                    value: /^[a-z0-9_]+$/,
                    message: 'Only lowercase letters, numbers, and underscores are allowed',
                  },
                })}
              />
              
              <Input
                id="label"
                label="Display Label"
                placeholder="e.g. Phone Number"
                helperText="This will be shown in the UI"
                error={errors.label?.message}
                fullWidth
                {...register('label', {
                  required: 'Display Label is required',
                })}
              />
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Field Type
                </label>
                <select
                  id="type"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register('type', {
                    required: 'Field Type is required',
                  })}
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="is_required"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      {...register('is_required')}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_required" className="font-medium text-gray-700">Required</label>
                    <p className="text-gray-500">Make this field mandatory</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="is_unique"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      {...register('is_unique')}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_unique" className="font-medium text-gray-700">Unique</label>
                    <p className="text-gray-500">Values must be unique across records</p>
                  </div>
                </div>
              </div>
              
              {['select', 'radio'].includes(selectedType) && (
                <div className="col-span-full">
                  <label htmlFor="options" className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <textarea
                    id="options"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                    placeholder="Comma-separated list of options (e.g. Red, Green, Blue)"
                    {...register('options', {
                      required: 'Options are required for this field type',
                    })}
                  />
                  {errors.options && (
                    <p className="mt-1 text-sm text-red-600">{errors.options.message}</p>
                  )}
                </div>
              )}
              
              {!['checkbox', 'select', 'radio', 'relation'].includes(selectedType) && (
                <Input
                  id="default_value"
                  label="Default Value"
                  placeholder="Optional default value"
                  fullWidth
                  {...register('default_value')}
                />
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<Check size={16} />}
              >
                Create Field
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <Card title="Fields">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-10 px-6 py-3"></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Field Label
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    API Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Required
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Unique
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entityFields.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                      No fields found. Create your first field to get started.
                    </td>
                  </tr>
                ) : (
                  entityFields.map((field) => (
                    <tr key={field.id}>
                      {editingFieldId === field.id ? (
                        <td colSpan={7} className="px-6 py-4">
                          <form onSubmit={handleSubmit(handleUpdateField)}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <Input
                                id="name"
                                label="API Name"
                                placeholder="e.g. phone_number (lowercase, no spaces)"
                                error={errors.name?.message}
                                fullWidth
                                {...register('name', {
                                  required: 'API Name is required',
                                  pattern: {
                                    value: /^[a-z0-9_]+$/,
                                    message: 'Only lowercase letters, numbers, and underscores are allowed',
                                  },
                                })}
                              />
                              
                              <Input
                                id="label"
                                label="Display Label"
                                placeholder="e.g. Phone Number"
                                error={errors.label?.message}
                                fullWidth
                                {...register('label', {
                                  required: 'Display Label is required',
                                })}
                              />
                              
                              <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                  Field Type
                                </label>
                                <select
                                  id="type"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  {...register('type', {
                                    required: 'Field Type is required',
                                  })}
                                >
                                  {fieldTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                                {errors.type && (
                                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                                )}
                              </div>
                              
                              <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                  <div className="flex h-5 items-center">
                                    <input
                                      id="is_required"
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      {...register('is_required')}
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="is_required" className="font-medium text-gray-700">Required</label>
                                    <p className="text-gray-500">Make this field mandatory</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-start">
                                  <div className="flex h-5 items-center">
                                    <input
                                      id="is_unique"
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      {...register('is_unique')}
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="is_unique" className="font-medium text-gray-700">Unique</label>
                                    <p className="text-gray-500">Values must be unique across records</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {['select', 'radio'].includes(selectedType) && (
                              <div className="col-span-full mt-4">
                                <label htmlFor="options" className="block text-sm font-medium text-gray-700">
                                  Options
                                </label>
                                <textarea
                                  id="options"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  rows={3}
                                  placeholder="Comma-separated list of options (e.g. Red, Green, Blue)"
                                  {...register('options', {
                                    required: 'Options are required for this field type',
                                  })}
                                />
                                {errors.options && (
                                  <p className="mt-1 text-sm text-red-600">{errors.options.message}</p>
                                )}
                              </div>
                            )}
                            
                            {!['checkbox', 'select', 'radio', 'relation'].includes(selectedType) && (
                              <div className="mt-4">
                                <Input
                                  id="default_value"
                                  label="Default Value"
                                  placeholder="Optional default value"
                                  fullWidth
                                  {...register('default_value')}
                                />
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end space-x-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingFieldId(null);
                                  reset();
                                }}
                                leftIcon={<X size={14} />}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                size="sm"
                                leftIcon={<Check size={14} />}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="cursor-move text-gray-400">
                              <GripVertical size={16} />
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{field.label}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {field.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {field.is_required ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {field.is_unique ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleStartEdit(field.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(field.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center">
              <AlertCircle className="mr-2 h-6 w-6 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Delete Field</h3>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this field? Any data associated with this field will be lost. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteField(deleteConfirm)}
              >
                Delete Field
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSettings;