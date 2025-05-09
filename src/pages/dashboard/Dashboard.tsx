import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Settings, ArrowRight } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useEntityStore } from '../../stores/entityStore';
import { useRecordStore } from '../../stores/recordStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { entities, fetchEntities } = useEntityStore();
  const { records, fetchRecords } = useRecordStore();
  
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  useEffect(() => {
    // Fetch records for each entity
    if (entities.length > 0) {
      entities.forEach(entity => {
        fetchRecords(entity.name);
      });
    }
  }, [entities, fetchRecords]);

  const getEntityIcon = (name: string) => {
    switch (name) {
      case 'users':
        return <Users size={20} className="text-purple-500" />;
      case 'accounts':
        return <Building size={20} className="text-blue-500" />;
      default:
        return <Building size={20} className="text-gray-500" />;
    }
  };

  const getEntityColor = (name: string) => {
    switch (name) {
      case 'users':
        return 'bg-purple-100 text-purple-800';
      case 'accounts':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your CRM system
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entities.map((entity) => (
          <Card key={entity.id} className="border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`rounded-full p-2 ${getEntityColor(entity.name)}`}>
                  {getEntityIcon(entity.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total {entity.label}</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    {records[entity.name]?.length || 0}
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/${entity.name}`)}
                rightIcon={<ArrowRight size={16} />}
              >
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Your latest actions in the system"
        >
          <div className="divide-y divide-gray-200">
            {records.accounts && records.accounts.slice(0, 5).map((account, index) => (
              <div key={index} className="flex items-center py-3">
                <div className="mr-4 rounded-full bg-blue-100 p-2 text-blue-600">
                  <Building size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{account.name}</p>
                  <p className="text-xs text-gray-500">Account created</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(account.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}

            {(!records.accounts || records.accounts.length === 0) && (
              <div className="py-4 text-center text-sm text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card
          title="Quick Actions"
          subtitle="Common tasks you can perform"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => navigate(`/${entity.name}/new`)}
                className="flex items-center rounded-md border border-gray-200 p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm"
              >
                <div className={`mr-3 rounded-full p-2 ${getEntityColor(entity.name)}`}>
                  {getEntityIcon(entity.name)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add {entity.label}</p>
                  <p className="text-sm text-gray-500">Create a new record</p>
                </div>
              </button>
            ))}

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center rounded-md border border-gray-200 p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm"
            >
              <div className="mr-3 rounded-full bg-gray-100 p-2 text-gray-600">
                <Settings size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Configure your CRM</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;