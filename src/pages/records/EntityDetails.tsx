import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  ArrowLeft, 
  Edit, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useEntityStore } from '../../stores/entityStore';
import { useRecordStore } from '../../stores/recordStore';
import { useAuthStore } from '../../stores/authStore';

const EntityDetails: React.FC = () => {
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { entities, fields, layouts, fetchEntities, fetchFields, fetchLayouts } = useEntityStore();
  const { 
    currentRecord, 
    fetchRecord, 
    createRecord, 
    updateRecord, 
    deleteRecord 
  } = useRecordStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      await fetchEntities();
      
      if (entityType) {
        const entity = entities.find(e => e.name === entityType);
        
        if (entity) {
          await Promise.all([
            fetchFields(entity.id),
            fetchLayouts(entity.id),
          ]);
          
          if (id && id !== 'new') {
            const record = await fetchRecord(entityType, id);
            if (record) {
              reset(record);
            }
          }
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [entityType, id, fetchEntities, fetchFields, fetchLayouts, fetchRecord, entities, reset]);
  
  if (!entityType) {
    return <div>Entity type not specified</div>;
  }
  
  const entity = entities.find(e => e.name === entityType);
  const entityFields = entity ? fields[entity.id] || [] : [];
  const entityLayouts = entity ? layouts[entity.id] || [] : [];
  
  // Find default layout or use first available
  const defaultLayout = entityLayouts.find(l => l.is_default) || entityLayouts[0];
  
  const isNewRecord = id === 'new';
  
  const onSubmit = async (data: any) => {
    try {
      if (isNewRecord) {
        // Add created_by if it's a field
        if (entityFields.some(field => field.name === 'created_by') && session) {
          data.created_by = session.user.id;
        }
        
        const newRecord = await createRecord(entityType, data);
        
        if (newRecord) {
          toast.success(`${entity?.label || 'Record'} created successfully`);
          navigate(`/${entityType}/${newRecord.id}`);
        } else {
          toast.error(`Failed to create ${entity?.label || 'record'}`);
        }
      } else if (id) {
        const updatedRecord = await updateRecord(entityType, id, data);
        
        if (updatedRecord) {
          toast.success(`${entity?.label || 'Record'} updated successfully`);
          setIsEditing(false);
        } else {
          toast.error(`Failed to update ${entity?.label || 'record'}`);
        }
      }
    } catch (error) {
      toast.error(`Error saving ${entity?.label || 'record'}`);
    }
  };
  
  const handleDelete = async () => {
    if (!id || isNewRecord) return;
    
    try {
      const success = await deleteRecord(entityType, id);
      
      if (success) {
        toast.success(`${entity?.label || 'Record'} deleted successfully`);
        navigate(`/${entityType}`);
      } else {
        toast.error(`Failed to delete ${entity?.label || 'record'}`);
      }
    } catch (error) {
      toast.error(`Error deleting ${entity?.label || 'record'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!entity) {
    return <div>Entity not found</div>;
  }
  
  // Get entity name singular
  const entitySingular = entity.label.endsWith('s') 
    ? entity.label.slice(0, -1) 
    : entity.label;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/${entityType}`)}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNewRecord ? `New ${entitySingular}` : (currentRecord?.[entityFields[0]?.name] || `${entitySingular} Details`)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isNewRecord ? `Create a new ${entitySingular.toLowerCase()}` : `View or edit this ${entitySingular.toLowerCase()}`}
            </p>
          </div>
        </div>
        
        {!isNewRecord && !isEditing && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<Edit size={16} />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 size={16} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        )}
        
        {(isNewRecord || isEditing) && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                if (isNewRecord) {
                  navigate(`/${entityType}`);
                } else {
                  setIsEditing(false);
                  reset(currentRecord);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              leftIcon={<Save size={16} />}
              onClick={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {entityFields.map((field) => {
                  // Don't show system fields or id in the form
                  if (field.name === 'id' || field.name === 'created_at' || field.name === 'created_by') {
                    return null;
                  }
                  
                  let inputComponent;
                  
                  switch (field.type) {
                    case 'textarea':
                      inputComponent = (
                        <div key={field.id} className="col-span-full">
                          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {field.label} {field.is_required && <span className="text-red-500">*</span>}
                          </label>
                          <textarea
                            id={field.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={4}
                            {...register(field.name, { required: field.is_required })}
                            disabled={!isEditing && !isNewRecord}
                          />
                          {errors[field.name] && (
                            <p className="mt-1 text-sm text-red-600">{field.label} is required</p>
                          )}
                        </div>
                      );
                      break;
                    
                    case 'email':
                      inputComponent = (
                        <Input
                          key={field.id}
                          id={field.name}
                          label={field.label}
                          type="email"
                          error={errors[field.name] ? `${field.label} is required` : undefined}
                          fullWidth
                          {...register(field.name, { 
                            required: field.is_required,
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                          disabled={!isEditing && !isNewRecord}
                        />
                      );
                      break;
                    
                    case 'url':
                      inputComponent = (
                        <Input
                          key={field.id}
                          id={field.name}
                          label={field.label}
                          type="url"
                          error={errors[field.name] ? `${field.label} is required` : undefined}
                          fullWidth
                          {...register(field.name, { 
                            required: field.is_required,
                            pattern: {
                              value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                              message: "Invalid URL"
                            }
                          })}
                          disabled={!isEditing && !isNewRecord}
                        />
                      );
                      break;
                      
                    default:
                      inputComponent = (
                        <Input
                          key={field.id}
                          id={field.name}
                          label={field.label}
                          type="text"
                          error={errors[field.name] ? `${field.label} is required` : undefined}
                          fullWidth
                          {...register(field.name, { required: field.is_required })}
                          disabled={!isEditing && !isNewRecord}
                        />
                      );
                  }
                  
                  return inputComponent;
                })}
              </div>
            )}
          </div>
        </Card>
      </form>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center">
              <AlertCircle className="mr-2 h-6 w-6 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this {entitySingular.toLowerCase()}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityDetails;