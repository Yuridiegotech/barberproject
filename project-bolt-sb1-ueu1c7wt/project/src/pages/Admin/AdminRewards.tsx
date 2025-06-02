import React, { useEffect, useState } from 'react';
import { useRewardStore } from '../../store/rewardStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { Award, Search, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserWithReward {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  serviceCount: number;
  freeServiceAvailable: boolean;
}

export const AdminRewards: React.FC = () => {
  const { rewardSettings, fetchRewardSettings, updateRewardSettings, grantFreeService, useFreeService } = useRewardStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserWithReward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserWithReward[]>([]);
  
  const [servicesForReward, setServicesForReward] = useState<string>('5');
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRewardSettings();
        await fetchUsers();
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      }
    };
    
    loadData();
  }, [fetchRewardSettings]);
  
  useEffect(() => {
    if (rewardSettings) {
      setServicesForReward(rewardSettings.servicesForReward.toString());
    }
  }, [rewardSettings]);
  
  useEffect(() => {
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(user => 
          user.email.toLowerCase().includes(lowerSearchTerm) ||
          user.firstName?.toLowerCase().includes(lowerSearchTerm) ||
          user.lastName?.toLowerCase().includes(lowerSearchTerm) ||
          user.phone?.includes(searchTerm)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First get all the users with their profile data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client');
      
      if (profilesError) throw profilesError;
      
      // Then get all rewards data
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*');
      
      if (rewardsError) throw rewardsError;
      
      // Combine the data
      const combinedData: UserWithReward[] = (profilesData || []).map(profile => {
        const userReward = (rewardsData || []).find(reward => reward.user_id === profile.id);
        
        return {
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          serviceCount: userReward?.service_count || 0,
          freeServiceAvailable: userReward?.free_service_available || false
        };
      });
      
      setUsers(combinedData);
      setFilteredUsers(combinedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const servicesValue = parseInt(servicesForReward);
    
    if (isNaN(servicesValue) || servicesValue <= 0) {
      toast.error('Por favor, insira um número válido');
      return;
    }
    
    try {
      await updateRewardSettings(servicesValue);
      setIsEditingSettings(false);
      toast.success('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    }
  };
  
  const handleGrantFreeService = async (userId: string) => {
    if (window.confirm('Conceder um serviço gratuito para este cliente?')) {
      try {
        await grantFreeService(userId);
        await fetchUsers();
        toast.success('Serviço gratuito concedido com sucesso!');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Ocorreu um erro. Tente novamente.');
      }
    }
  };
  
  const handleUseFreeService = async (userId: string) => {
    if (window.confirm('Marcar serviço gratuito como utilizado?')) {
      try {
        await useFreeService(userId);
        await fetchUsers();
        toast.success('Serviço gratuito marcado como utilizado!');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Ocorreu um erro. Tente novamente.');
      }
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Gerenciar Cortesias</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Award size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">Regras de Cortesia</h3>
          </div>
          
          {isEditingSettings ? (
            <form onSubmit={handleUpdateSettings}>
              <Input
                label="Serviços para ganhar uma cortesia"
                type="number"
                value={servicesForReward}
                onChange={(e) => setServicesForReward(e.target.value)}
                required
                min="1"
                className="mb-4"
              />
              
              <div className="flex gap-3">
                <Button type="submit" size="sm">
                  Salvar
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setServicesForReward(rewardSettings?.servicesForReward.toString() || '5');
                    setIsEditingSettings(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <p className="mb-4 text-gray-600">
                A cada <span className="font-semibold">{rewardSettings?.servicesForReward || 5}</span> serviços realizados, 
                o cliente ganha um serviço gratuito.
              </p>
              
              <Button
                onClick={() => setIsEditingSettings(true)}
                size="sm"
              >
                Editar Regras
              </Button>
            </div>
          )}
        </div>
        
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UserCheck size={20} className="text-blue-500 mr-2" />
              <h3 className="text-lg font-medium">Clientes com Cortesias</h3>
            </div>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Carregando clientes...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.freeServiceAvailable ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Cortesia Disponível
                          </span>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {user.serviceCount} / {rewardSettings?.servicesForReward || 5} serviços
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.freeServiceAvailable ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUseFreeService(user.id)}
                          >
                            Marcar como Utilizado
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGrantFreeService(user.id)}
                          >
                            Conceder Cortesia
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum cliente encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};