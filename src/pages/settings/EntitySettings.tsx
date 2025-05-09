import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Database,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useEntityStore } from '../../stores/entityStore';

interface EntityFormData {
  name: string;
  label: string;
  description?: string;
  icon?: string;
}

const EntitySettings: React.FC = () => {
  const navigate = useNavigate();
  const { entities, fetchEntities, createEntity, updateEntity } = useEntityStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntityFormData>();
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchEntities();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchEntities]);
  
  const handleCreateEntity = async (data: EntityFormData) => {
    try {
      // Convert name to lowercase and replace spaces with underscores
      const formattedName = data.name.toLowerCase().replace(/\s+/g, '_');
      
      const newEntity = await createEntity({
        ...data,
        name: formattedName,
        is_system: false,
      });
      
      if (newEntity) {
        toast.success('Entity created successfully');
        setShowCreateForm(false);
        reset();
      } else {
        toast.error('Failed to create entity');
      }
    } catch (error) {
      toast.error('Error creating entity');
    }
  };
  
  const handleEditEntity = async (data: EntityFormData) => {
    if (!editingEntityId) return;
    
    try {
      // For system entities, don't allow name changes
      const entity = entities.find((e) => e.id === editingEntityId);
      
      if (entity?.is_system) {
        data.name = entity.name;
      } else {
        // Convert name to lowercase and replace spaces with underscores
        data.name = data.name.toLowerCase().replace(/\s+/g, '_');
      }
      
      const updatedEntity = await updateEntity(editingEntityId, data);
      
      if (updatedEntity) {
        toast.success('Entity updated successfully');
        setEditingEntityId(null);
      } else {
        toast.error('Failed to update entity');
      }
    } catch (error) {
      toast.error('Error updating entity');
    }
  };
  
  const handleStartEdit = (entityId: string) => {
    const entity = entities.find((e) => e.id === entityId);
    if (entity) {
      reset({
        name: entity.name,
        label: entity.label,
        description: entity.description || '',
        icon: entity.icon || '',
      });
      setEditingEntityId(entityId);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingEntityId(null);
    reset();
  };
  
  const handleStartCreate = () => {
    reset();
    setShowCreateForm(true);
  };
  
  const handleCancelCreate = () => {
    setShowCreateForm(false);
    reset();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/settings')}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Settings
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entity Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure and customize record types
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleStartCreate}
          leftIcon={<Plus size={16} />}
          disabled={showCreateForm}
        >
          Create Entity
        </Button>
      </div>
      
      {showCreateForm && (
        <Card title="Create New Entity">
          <form onSubmit={handleSubmit(handleCreateEntity)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                id="name"
                label="API Name"
                placeholder="e.g. opportunities (lowercase, no spaces)"
                helperText="This will be used in the API and URLs"
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
                placeholder="e.g. Opportunities"
                helperText="This will be shown in the UI"
                error={errors.label?.message}
                fullWidth
                {...register('label', {
                  required: 'Display Label is required',
                })}
              />
              
              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  placeholder="Describe the purpose of this entity"
                  {...register('description')}
                />
              </div>
              
              <Input
                id="icon"
                label="Icon Name"
                placeholder="e.g. users or building"
                helperText="Name of the Lucide icon to use"
                fullWidth
                {...register('icon')}
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelCreate}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<Check size={16} />}
              >
                Create Entity
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <Card title="Entities">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Entity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    API Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fields
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      No entities found. Create your first entity to get started.
                    </td>
                  </tr>
                ) : (
                  entities.map((entity) => (
                    <tr key={entity.id}>
                      {editingEntityId === entity.id ? (
                        <td colSpan={5} className="px-6 py-4">
                          <form onSubmit={handleSubmit(handleEditEntity)}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <Input
                                id="name"
                                label="API Name"
                                placeholder="e.g. opportunities (lowercase, no spaces)"
                                error={errors.name?.message}
                                fullWidth
                                disabled={entity.is_system}
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
                                placeholder="e.g. Opportunities"
                                error={errors.label?.message}
                                fullWidth
                                {...register('label', {
                                  required: 'Display Label is required',
                                })}
                              />
                              
                              <Input
                                id="icon"
                                label="Icon Name"
                                placeholder="e.g. users or building"
                                fullWidth
                                {...register('icon')}
                              />
                              
                              <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <textarea
                                  id="description"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  rows={2}
                                  placeholder="Describe the purpose of this entity"
                                  {...register('description')}
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end space-x-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
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
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 p-2 text-indigo-600">
                                <Database className="h-6 w-6" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{entity.label}</div>
                                <div className="text-sm text-gray-500">{entity.description || 'No description'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {entity.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              entity.is_system 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {entity.is_system ? 'System' : 'Custom'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => navigate(`/settings/entities/${entity.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Manage Fields
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleStartEdit(entity.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Pencil size={16} />
                              </button>
                              {!entity.is_system && (
                                <button
                                  onClick={() => setDeleteConfirm(entity.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
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
              <h3 className="text-lg font-medium text-gray-900">Delete Entity</h3>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this entity? This will delete all associated fields, layouts, and data. This action cannot be undone.
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
                onClick={() => {
                  // Delete functionality would go here
                  toast.error("Entity deletion is not implemented in this demo");
                  setDeleteConfirm(null);
                }}
              >
                Delete Entity
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntitySettings;