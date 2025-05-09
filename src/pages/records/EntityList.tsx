import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useEntityStore } from '../../stores/entityStore';
import { useRecordStore } from '../../stores/recordStore';
import { useAuthStore } from '../../stores/authStore';

const EntityList: React.FC = () => {
  const { entityType } = useParams<{ entityType: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { entities, fields, fetchEntities, fetchFields } = useEntityStore();
  const { records, fetchRecords, deleteRecord } = useRecordStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchEntities();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchEntities]);
  
  useEffect(() => {
    if (entityType && entities.length > 0) {
      const entity = entities.find(e => e.name === entityType);
      if (entity) {
        fetchFields(entity.id);
        fetchRecords(entityType);
      }
    }
  }, [entityType, entities, fetchFields, fetchRecords]);
  
  if (!entityType) {
    return <div>Entity type not specified</div>;
  }
  
  const entity = entities.find(e => e.name === entityType);
  const entityFields = entity ? fields[entity.id] || [] : [];
  const entityRecords = records[entityType] || [];
  
  // Sort records
  const sortedRecords = [...entityRecords].sort((a, b) => {
    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Handle string sorting
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Filter records based on search term
  const filteredRecords = sortedRecords.filter(record => {
    if (!searchTerm) return true;
    
    // Search through all fields
    return Object.entries(record).some(([key, value]) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteRecord(entityType, id);
      if (success) {
        toast.success(`${entity?.label || 'Record'} deleted successfully`);
        setShowDeleteConfirm(null);
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{entity.label}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {entity.label.toLowerCase()}
          </p>
        </div>
        <Button
          onClick={() => navigate(`/${entityType}/new`)}
          leftIcon={<PlusCircle size={16} />}
        >
          Add {entity.label.slice(0, -1)}
        </Button>
      </div>
      
      <Card>
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder={`Search ${entity.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
              fullWidth
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter size={16} />}
            >
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowUpDown size={16} />}
            >
              Sort
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {entityFields.slice(0, 5).map((field) => (
                  <th
                    key={field.id}
                    scope="col"
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort(field.name)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{field.label}</span>
                      <span className="invisible text-gray-400 group-hover:visible">
                        {sortField === field.name && (
                          <ArrowUpDown size={14} className="text-gray-500" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
                <th
                  scope="col"
                  className="group cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created At</span>
                    <span className="invisible text-gray-400 group-hover:visible">
                      {sortField === 'created_at' && (
                        <ArrowUpDown size={14} className="text-gray-500" />
                      )}
                    </span>
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={entityFields.slice(0, 5).length + 2}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50"
                  >
                    {entityFields.slice(0, 5).map((field) => (
                      <td
                        key={`${record.id}-${field.id}`}
                        className="whitespace-nowrap px-6 py-4"
                      >
                        <div className="text-sm text-gray-900">
                          {record[field.name] || '-'}
                        </div>
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/${entityType}/${record.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/${entityType}/${record.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this {entity.label.toLowerCase().slice(0, -1)}? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
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

export default EntityList;