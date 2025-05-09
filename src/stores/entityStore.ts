import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Entity {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
  icon: string | null;
}

interface Field {
  id: string;
  entity_id: string;
  name: string;
  label: string;
  type: string;
  is_required: boolean;
  is_unique: boolean;
  default_value: any;
  options: any;
  display_order: number;
}

interface Layout {
  id: string;
  entity_id: string;
  name: string;
  type: string;
  definition: any;
  is_default: boolean;
}

interface EntityState {
  entities: Entity[];
  fields: Record<string, Field[]>;
  layouts: Record<string, Layout[]>;
  isLoading: boolean;
  error: string | null;
  
  fetchEntities: () => Promise<void>;
  fetchFields: (entityId: string) => Promise<Field[]>;
  fetchLayouts: (entityId: string) => Promise<Layout[]>;
  
  createEntity: (entity: Omit<Entity, 'id'>) => Promise<Entity | null>;
  updateEntity: (id: string, updates: Partial<Entity>) => Promise<Entity | null>;
  
  createField: (field: Omit<Field, 'id'>) => Promise<Field | null>;
  updateField: (id: string, updates: Partial<Field>) => Promise<Field | null>;
  deleteField: (id: string) => Promise<boolean>;
  
  createLayout: (layout: Omit<Layout, 'id'>) => Promise<Layout | null>;
  updateLayout: (id: string, updates: Partial<Layout>) => Promise<Layout | null>;
  deleteLayout: (id: string) => Promise<boolean>;
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  fields: {},
  layouts: {},
  isLoading: false,
  error: null,
  
  fetchEntities: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('entity_definitions')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      set({ entities: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchFields: async (entityId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('field_definitions')
        .select('*')
        .eq('entity_id', entityId)
        .order('display_order');
        
      if (error) throw error;
      
      set((state) => ({
        fields: { ...state.fields, [entityId]: data },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  fetchLayouts: async (entityId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('layout_definitions')
        .select('*')
        .eq('entity_id', entityId);
        
      if (error) throw error;
      
      set((state) => ({
        layouts: { ...state.layouts, [entityId]: data },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  createEntity: async (entity) => {
    set({ isLoading: true, error: null });
    
    try {
      // First create the entity definition
      const { data, error } = await supabase
        .from('entity_definitions')
        .insert(entity)
        .select()
        .single();
        
      if (error) throw error;

      // Then create the actual table via Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-entity-table`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityName: entity.name,
          fields: [] // Will be populated when fields are added
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create table');
      }
      
      set((state) => ({
        entities: [...state.entities, data],
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  updateEntity: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('entity_definitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      set((state) => ({
        entities: state.entities.map((e) => (e.id === id ? data : e)),
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  createField: async (field) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('field_definitions')
        .insert(field)
        .select()
        .single();
        
      if (error) throw error;
      
      const entityId = field.entity_id;
      const currentFields = get().fields[entityId] || [];
      
      set((state) => ({
        fields: { 
          ...state.fields, 
          [entityId]: [...currentFields, data]
        },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  updateField: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('field_definitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      const entityId = data.entity_id;
      
      set((state) => ({
        fields: {
          ...state.fields,
          [entityId]: state.fields[entityId].map((f) => 
            f.id === id ? data : f
          ),
        },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  deleteField: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // First, get the field to know which entity it belongs to
      const field = Object.values(get().fields)
        .flat()
        .find((f) => f.id === id);
        
      if (!field) throw new Error('Field not found');
      
      const { error } = await supabase
        .from('field_definitions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        fields: {
          ...state.fields,
          [field.entity_id]: state.fields[field.entity_id].filter((f) => 
            f.id !== id
          ),
        },
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  createLayout: async (layout) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('layout_definitions')
        .insert(layout)
        .select()
        .single();
        
      if (error) throw error;
      
      const entityId = layout.entity_id;
      const currentLayouts = get().layouts[entityId] || [];
      
      set((state) => ({
        layouts: { 
          ...state.layouts, 
          [entityId]: [...currentLayouts, data]
        },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  updateLayout: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('layout_definitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      const entityId = data.entity_id;
      
      set((state) => ({
        layouts: {
          ...state.layouts,
          [entityId]: state.layouts[entityId].map((l) => 
            l.id === id ? data : l
          ),
        },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  deleteLayout: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // First, get the layout to know which entity it belongs to
      const layout = Object.values(get().layouts)
        .flat()
        .find((l) => l.id === id);
        
      if (!layout) throw new Error('Layout not found');
      
      const { error } = await supabase
        .from('layout_definitions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        layouts: {
          ...state.layouts,
          [layout.entity_id]: state.layouts[layout.entity_id].filter((l) => 
            l.id !== id
          ),
        },
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));