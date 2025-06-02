import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Calendar, Users, Award, BarChart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AdminServices } from './AdminServices';
import { AdminSchedule } from './AdminSchedule';
import { AdminRewards } from './AdminRewards';
import { AdminReports } from './AdminReports';
import { useAuthStore } from '../../store/authStore';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'services' | 'schedule' | 'rewards' | 'reports'>('services');
  
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie sua barbearia</p>
          </div>
        </div>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex border-b border-gray-200 min-w-max">
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'services' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('services')}
            >
              <div className="flex items-center">
                <Layers size={16} className="mr-1.5" />
                Serviços
              </div>
            </button>
            
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'schedule' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('schedule')}
            >
              <div className="flex items-center">
                <Calendar size={16} className="mr-1.5" />
                Horários
              </div>
            </button>
            
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'rewards' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('rewards')}
            >
              <div className="flex items-center">
                <Award size={16} className="mr-1.5" />
                Cortesias
              </div>
            </button>
            
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === 'reports' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <div className="flex items-center">
                <BarChart size={16} className="mr-1.5" />
                Relatórios
              </div>
            </button>
          </div>
        </div>
        
        <div>
          {activeTab === 'services' && <AdminServices />}
          {activeTab === 'schedule' && <AdminSchedule />}
          {activeTab === 'rewards' && <AdminRewards />}
          {activeTab === 'reports' && <AdminReports />}
        </div>
      </div>
    </div>
  );
};