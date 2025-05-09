import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Database, 
  Layout, 
  User, 
  Shield, 
  ChevronRight 
} from 'lucide-react';

import Card from '../../components/ui/Card';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const settingsCategories = [
    {
      id: 'entities',
      name: 'Entity Management',
      description: 'Configure record types and fields',
      icon: <Database className="h-6 w-6 text-indigo-600" />,
      path: '/settings/entities',
    },
    {
      id: 'layouts',
      name: 'Layout Settings',
      description: 'Customize how records are displayed',
      icon: <Layout className="h-6 w-6 text-indigo-600" />,
      path: '/settings/layouts',
    },
    {
      id: 'account',
      name: 'Account Settings',
      description: 'Manage your user account',
      icon: <User className="h-6 w-6 text-indigo-600" />,
      path: '/settings/account',
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Set up access controls and permissions',
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      path: '/settings/security',
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your CRM system
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {settingsCategories.map((category) => (
          <Card key={category.id} className="border border-gray-100 transition-all hover:border-indigo-200 hover:shadow-md">
            <button
              className="flex w-full items-center"
              onClick={() => navigate(category.path)}
            >
              <div className="mr-4">{category.icon}</div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;