import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Layout, 
  Move, 
  Plus, 
  Save, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useEntityStore } from '../../stores/entityStore';
import { useAuthStore } from '../../stores/authStore';

const LayoutSettings: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { 
    entities, 
    fields, 
    layouts,
    fetchEntities,
    fetchFields,
    fetchLayouts,
    createLayout,
    updateLayout
  } = useEntityStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<any>({
    sections: [
      {
        title: 'Information',
        columns: 2,
        fields: []
      }
    ]
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    name: string;
    type: string;
    is_default: boolean;
  }>();
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      await fetchEntities();
      
      if (entityId) {
        await Promise.all([
          fetchFields(entityId),
          fetchLayouts(entityId)
        ]);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [entityId, fetchEntities, fetchFields, fetchLayouts]);
  
  useEffect(() => {
    if (entityId && fields[entityId] && !selectedLayout) {
      // Create a default layout config with all fields
      const defaultConfig = {
        sections: [
          {
            title: 'Information',
            columns: 2,
            fields: fields[entityId]
              .filter(field => !['id', 'created_at', 'created_by'].includes(field.name))
              .map(field => ({
                id: field.id,
                name: field.name,
                label: field.label,
                type: field.type,
                is_required: field.is_required,
                is_visible: true
              }))
          }
        ]
      };
      
      setLayoutConfig(defaultConfig);
    }
  }, [entityId, fields, selectedLayout]);
  
  useEffect(() => {
    if (layouts[entityId as string] && layouts[entityId as string].length > 0 && !selectedLayout) {
      // Select the default layout or the first one
      const defaultLayout = layouts[entityId as string].find(l => l.is_default);
      setSelectedLayout(defaultLayout?.id || layouts[entityId as string][0].id);
      
      if (defaultLayout?.definition) {
        setLayoutConfig(defaultLayout.definition);
      }
    }
  }, [entityId, layouts, selectedLayout]);
  
  const entity = entities.find(e => e.id === entityId);
  const entityFields = entityId ? fields[entityId] || [] : [];
  const entityLayouts = entityId ? layouts[entityId] || [] : [];
  
  const currentLayout = entityLayouts.find(l => l.id === selectedLayout);
  
  const toggleFieldVisibility = (sectionIndex: number, fieldIndex: number) => {
    const newLayoutConfig = { ...layoutConfig };
    newLayoutConfig.sections[sectionIndex].fields[fieldIndex].is_visible = 
      !newLayoutConfig.sections[sectionIndex].fields[fieldIndex].is_visible;
    
    setLayoutConfig(newLayoutConfig);
  };
  
  const handleCreateLayout = async (data: any) => {
    if (!entityId || !session) return;
    
    try {
      const newLayout = await createLayout({
        entity_id: entityId,
        name: data.name,
        type: data.type,
        definition: layoutConfig,
        is_default: data.is_default,
        created_by: session.user.id
      });
      
      if (newLayout) {
        toast.success('Layout created successfully');
        setSelectedLayout(newLayout.id);
      } else {
        toast.error('Failed to create layout');
      }
    } catch (error) {
      toast.error('Error creating layout');
    }
  };
  
  const handleUpdateLayout = async () => {
    if (!entityId || !selectedLayout) return;
    
    try {
      const updatedLayout = await updateLayout(selectedLayout, {
        definition: layoutConfig
      });
      
      if (updatedLayout) {
        toast.success('Layout updated successfully');
      } else {
        toast.error('Failed to update layout');
      }
    } catch (error) {
      toast.error('Error updating layout');
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
          onClick={() => navigate(`/settings/entities/${entityId}`)}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Fields
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Layout for {entity.label}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize how records are displayed
          </p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <label htmlFor="layoutSelect" className="text-sm font-medium text-gray-700">
            Select Layout:
          </label>
          <select
            id="layoutSelect"
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={selectedLayout || ''}
            onChange={(e) => {
              const layoutId = e.target.value;
              setSelectedLayout(layoutId);
              
              // Load the layout configuration
              const layout = entityLayouts.find(l => l.id === layoutId);
              if (layout?.definition) {
                setLayoutConfig(layout.definition);
              }
            }}
          >
            <option value="">-- Select Layout --</option>
            {entityLayouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name} {layout.is_default ? '(Default)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        {!selectedLayout && (
          <Button
            onClick={() => {
              document.getElementById('createLayoutForm')?.scrollIntoView({ behavior: 'smooth' });
            }}
            leftIcon={<Plus size={16} />}
          >
            Create Layout
          </Button>
        )}
        
        {selectedLayout && (
          <Button
            onClick={handleUpdateLayout}
            leftIcon={<Save size={16} />}
          >
            Save Layout
          </Button>
        )}
      </div>
      
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {layoutConfig.sections.map((section: any, sectionIndex: number) => (
              <div 
                key={`section-${sectionIndex}`}
                className="rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={section.columns}
                      onChange={(e) => {
                        const newLayoutConfig = { ...layoutConfig };
                        newLayoutConfig.sections[sectionIndex].columns = parseInt(e.target.value);
                        setLayoutConfig(newLayoutConfig);
                      }}
                    >
                      <option value={1}>1 Column</option>
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => {
                        const newLayoutConfig = { ...layoutConfig };
                        newLayoutConfig.sections.splice(sectionIndex, 1);
                        setLayoutConfig(newLayoutConfig);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                
                <div className={`grid grid-cols-1 gap-4 md:grid-cols-${section.columns}`}>
                  {section.fields.map((field: any, fieldIndex: number) => (
                    <div
                      key={`field-${field.id}`}
                      className={`flex cursor-move items-center justify-between rounded-md border ${
                        field.is_visible ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-100'
                      } p-3`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-400">
                          <Move size={16} />
                        </span>
                        <div>
                          <p className={`font-medium ${field.is_visible ? 'text-gray-900' : 'text-gray-500'}`}>
                            {field.label}
                            {field.is_required && <span className="ml-1 text-red-500">*</span>}
                          </p>
                          <p className="text-xs text-gray-500">{field.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className={`rounded-full p-1 ${
                            field.is_visible 
                              ? 'text-indigo-600 hover:bg-indigo-100' 
                              : 'text-gray-400 hover:bg-gray-200'
                          }`}
                          onClick={() => toggleFieldVisibility(sectionIndex, fieldIndex)}
                        >
                          {field.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-1 text-red-600 hover:bg-red-100"
                          onClick={() => {
                            const newLayoutConfig = { ...layoutConfig };
                            newLayoutConfig.sections[sectionIndex].fields.splice(fieldIndex, 1);
                            setLayoutConfig(newLayoutConfig);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {section.fields.length === 0 && (
                  <div className="mt-4 rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
                    <p className="text-sm text-gray-500">
                      No fields in this section. Drag fields here to add them.
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Show a dropdown to select a field to add
                      const availableFields = entityFields.filter(field => 
                        !['id', 'created_at', 'created_by'].includes(field.name) &&
                        !layoutConfig.sections.some((s: any) => 
                          s.fields.some((f: any) => f.id === field.id)
                        )
                      );
                      
                      if (availableFields.length > 0) {
                        // Add the first available field
                        const fieldToAdd = availableFields[0];
                        const newLayoutConfig = { ...layoutConfig };
                        newLayoutConfig.sections[sectionIndex].fields.push({
                          id: fieldToAdd.id,
                          name: fieldToAdd.name,
                          label: fieldToAdd.label,
                          type: fieldToAdd.type,
                          is_required: fieldToAdd.is_required,
                          is_visible: true
                        });
                        setLayoutConfig(newLayoutConfig);
                      } else {
                        toast.error('No more fields available to add');
                      }
                    }}
                  >
                    Add Field
                  </Button>
                </div>
              </div>
            ))}
            
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  const newLayoutConfig = { ...layoutConfig };
                  newLayoutConfig.sections.push({
                    title: `Section ${newLayoutConfig.sections.length + 1}`,
                    columns: 2,
                    fields: []
                  });
                  setLayoutConfig(newLayoutConfig);
                }}
                leftIcon={<Plus size={16} />}
              >
                Add Section
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {!selectedLayout && (
        <Card title="Create New Layout" id="createLayoutForm">
          <form onSubmit={handleSubmit(handleCreateLayout)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                id="name"
                label="Layout Name"
                placeholder="e.g. Default Layout"
                error={errors.name?.message}
                fullWidth
                {...register('name', {
                  required: 'Layout Name is required',
                })}
              />
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Layout Type
                </label>
                <select
                  id="type"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register('type', {
                    required: 'Layout Type is required',
                  })}
                >
                  <option value="detail">Detail View</option>
                  <option value="edit">Edit Form</option>
                  <option value="list">List View</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="is_default"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      {...register('is_default')}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="is_default" className="font-medium text-gray-700">
                      Set as Default Layout
                    </label>
                    <p className="text-gray-500">
                      This layout will be used as the default for this entity
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                leftIcon={<Layout size={16} />}
              >
                Create Layout
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default LayoutSettings;