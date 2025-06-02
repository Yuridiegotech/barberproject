import React, { useEffect, useState } from 'react';
import { BarChart, Calendar, Users, ClipboardList } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface StatsData {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalAppointments: number;
}

interface ServiceStats {
  serviceName: string;
  count: number;
}

interface TimeStats {
  period: string;
  count: number;
}

export const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    totalAppointments: 0,
  });
  
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [timeStats, setTimeStats] = useState<TimeStats[]>([]);
  
  useEffect(() => {
    loadStats();
    loadServiceStats();
    loadTimeStats();
  }, []);
  
  const loadStats = async () => {
    setLoading(true);
    try {
      // Get total clients
      const { count: totalClients, error: clientsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');
      
      if (clientsError) throw clientsError;
      
      // Get active clients (with appointment in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeData, error: activeError } = await supabase
        .from('appointments')
        .select('user_id')
        .gte('date', thirtyDaysAgo.toISOString())
        .not('user_id', 'is', null);
      
      if (activeError) throw activeError;
      
      // Get unique active user IDs
      const activeUserIds = new Set(activeData?.map(a => a.user_id));
      const activeClientsCount = activeUserIds.size;
      
      // Get total appointments
      const { count: totalAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });
      
      if (appointmentsError) throw appointmentsError;
      
      setStats({
        totalClients: totalClients || 0,
        activeClients: activeClientsCount,
        inactiveClients: (totalClients || 0) - activeClientsCount,
        totalAppointments: totalAppointments || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };
  
  const loadServiceStats = async () => {
    try {
      // Get all appointment services
      const { data: appointmentServices, error: servicesError } = await supabase
        .from('appointment_services')
        .select(`
          service_id,
          appointments!inner(
            status
          )
        `)
        .eq('appointments.status', 'completed');
      
      if (servicesError) throw servicesError;
      
      // Count services
      const serviceCounts: Record<number, number> = {};
      appointmentServices?.forEach(as => {
        serviceCounts[as.service_id] = (serviceCounts[as.service_id] || 0) + 1;
      });
      
      // Get service names
      const serviceIds = Object.keys(serviceCounts).map(Number);
      
      if (serviceIds.length > 0) {
        const { data: services, error: servicesNamesError } = await supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds);
        
        if (servicesNamesError) throw servicesNamesError;
        
        const stats = services?.map(service => ({
          serviceName: service.name,
          count: serviceCounts[service.id]
        })) || [];
        
        // Sort by count, descending
        stats.sort((a, b) => b.count - a.count);
        
        setServiceStats(stats);
      } else {
        setServiceStats([]);
      }
    } catch (error) {
      console.error('Error loading service stats:', error);
      toast.error('Erro ao carregar estatísticas de serviços');
    }
  };
  
  const loadTimeStats = async () => {
    try {
      // Get appointment dates and extract months
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('date');
      
      if (appointmentsError) throw appointmentsError;
      
      // Count by month
      const monthCounts: Record<string, number> = {};
      
      appointments?.forEach(appointment => {
        const date = new Date(appointment.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
      });
      
      // Convert to array and sort by month/year
      const stats = Object.entries(monthCounts)
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.period.split('/').map(Number);
          const [bMonth, bYear] = b.period.split('/').map(Number);
          
          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        })
        .slice(-6); // Get only the last 6 months
      
      setTimeStats(stats);
    } catch (error) {
      console.error('Error loading time stats:', error);
      toast.error('Erro ao carregar estatísticas de tempo');
    }
  };
  
  const exportData = () => {
    alert('Funcionalidade de exportação será implementada em uma versão futura.');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Relatórios</h2>
        
        <Button
          onClick={exportData}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <ClipboardList size={16} />
          Exportar Dados
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Clientes</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? '...' : stats.totalClients}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes Ativos</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? '...' : stats.activeClients}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start">
            <div className="bg-red-100 p-3 rounded-full mr-3">
              <Users size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes Inativos</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? '...' : stats.inactiveClients}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start">
            <div className="bg-purple-100 p-3 rounded-full mr-3">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Agendamentos</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? '...' : stats.totalAppointments}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Services Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">Serviços Mais Populares</h3>
          </div>
          
          {serviceStats.length > 0 ? (
            <div className="space-y-3">
              {serviceStats.map((stat, index) => (
                <div key={index} className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stat.serviceName}</span>
                    <span className="text-sm font-medium text-gray-700">{stat.count}</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${(stat.count / serviceStats[0].count) * 100}%` }}
                      className="bg-blue-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum dado disponível</p>
            </div>
          )}
        </div>
        
        {/* Time Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">Agendamentos por Período</h3>
          </div>
          
          {timeStats.length > 0 ? (
            <div className="space-y-3">
              {timeStats.map((stat, index) => (
                <div key={index} className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stat.period}</span>
                    <span className="text-sm font-medium text-gray-700">{stat.count}</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${(stat.count / Math.max(...timeStats.map(s => s.count))) * 100}%` }}
                      className="bg-green-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};