import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useEntityStore } from './entityStore';

interface RecordState {
  records: Record<string, any[]>;
  currentRecord: any | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRecords: (entityName: string) => Promise<any[]>;
  fetchRecord: (entityName: string, id: string) => Promise<any | null>;
  createRecord: (entityName: string, data: any) => Promise<any | null>;
  updateRecord: (entityName: string, id: string, data: any) => Promise<any | null>;
  deleteRecord: (entityName: string, id: string) => Promise<boolean>;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: {},
  currentRecord: null,
  isLoading: false,
  error: null,
  
  fetchRecords: async (entityName) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from(entityName)
        .select('*');
        
      if (error) throw error;
      
      set((state) => ({
        records: { ...state.records, [entityName]: data },
        isLoading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  fetchRecord: async (entityName, id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from(entityName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      set({ currentRecord: data, isLoading: false });
      
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  createRecord: async (entityName, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error: insertError, data: insertedData } = await supabase
        .from(entityName)
        .insert(data)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      set((state) => {
        const currentRecords = state.records[entityName] || [];
        return {
          records: { 
            ...state.records, 
            [entityName]: [...currentRecords, insertedData] 
          },
          isLoading: false,
        };
      });
      
      return insertedData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  updateRecord: async (entityName, id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error: updateError, data: updatedData } = await supabase
        .from(entityName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      set((state) => {
        const currentRecords = state.records[entityName] || [];
        return {
          records: { 
            ...state.records, 
            [entityName]: currentRecords.map(record => 
              record.id === id ? updatedData : record
            ) 
          },
          currentRecord: state.currentRecord?.id === id 
            ? updatedData 
            : state.currentRecord,
          isLoading: false,
        };
      });
      
      return updatedData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  deleteRecord: async (entityName, id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error: deleteError } = await supabase
        .from(entityName)
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      set((state) => {
        const currentRecords = state.records[entityName] || [];
        return {
          records: { 
            ...state.records, 
            [entityName]: currentRecords.filter(record => record.id !== id) 
          },
          currentRecord: state.currentRecord?.id === id ? null : state.currentRecord,
          isLoading: false,
        };
      });
      
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));