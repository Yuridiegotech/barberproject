import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, Award, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useRewardStore } from '../../store/rewardStore';

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments, fetchUserAppointments, cancelAppointment } = useAppointmentStore();
  const { userReward, rewardSettings, fetchUserReward, fetchRewardSettings } = useRewardStore();
  
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'rewards'>('appointments');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        await fetchUserAppointments(user.id);
        await fetchUserReward(user.id);
        await fetchRewardSettings();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchUserAppointments, fetchUserReward, fetchRewardSettings]);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleCancelAppointment = async (appointmentId: number) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      await cancelAppointment(appointmentId);
      toast.success('Agendamento cancelado com sucesso!');
    }
  };
  
  const renderAppointmentsTab = () => {
    const futureAppointments = appointments.filter(
      app => new Date(app.date) > new Date() && app.status !== 'cancelled'
    );
    
    const pastAppointments = appointments.filter(
      app => new Date(app.date) <= new Date() || app.status === 'cancelled'
    );
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Meus Agendamentos</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-gray-600">Carregando agendamentos...</p>
          </div>
        ) : (
          <>
            {futureAppointments.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Próximos</h3>
                <div className="space-y-4">
                  {futureAppointments.map(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    return (
                      <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <Calendar size={18} className="mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
                            <div>
                              <p className="font-medium">
                                {format(appointmentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {format(appointmentDate, "HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            Cancelar
                          </Button>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium mb-1">Serviços:</p>
                          <div className="space-y-1">
                            {appointment.services.map(service => (
                              <div key={service.id} className="flex justify-between text-sm">
                                <span>{service.name}</span>
                                <span>R$ {service.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center mb-8">
                <p className="text-gray-600 mb-4">Você não possui agendamentos futuros.</p>
                <Button onClick={() => navigate('/')} size="sm">
                  Agendar agora
                </Button>
              </div>
            )}
            
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Histórico</h3>
                <div className="space-y-2">
                  {pastAppointments.map(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    const isCancelled = appointment.status === 'cancelled';
                    
                    return (
                      <div 
                        key={appointment.id} 
                        className={`bg-white rounded-lg shadow-sm border p-3 ${
                          isCancelled ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <Calendar size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${
                            isCancelled ? 'text-gray-400' : 'text-blue-500'
                          }`} />
                          <div>
                            <div className="flex items-center">
                              <p className={`font-medium ${isCancelled ? 'text-gray-500' : ''}`}>
                                {format(appointmentDate, "d 'de' MMMM", { locale: ptBR })}
                              </p>
                              {isCancelled && (
                                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                                  Cancelado
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                              {format(appointmentDate, "HH:mm", { locale: ptBR })}
                              {!isCancelled && 
                                ` • ${appointment.services.map(s => s.name).join(', ')}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  
  const renderProfileTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-6">Meu Perfil</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{user.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sobrenome</p>
                <p className="font-medium">{user.lastName}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{user.phone || '—'}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100">
            <Button 
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-1"
            >
              Editar informações
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderRewardsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Meus Benefícios</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-gray-600">Carregando informações...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {userReward ? (
              <div>
                {userReward.freeServiceAvailable ? (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <Award size={24} className="text-green-500 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-green-800">Você tem um corte grátis disponível!</h3>
                        <p className="text-green-600 text-sm mt-1">
                          Apresente esta tela no seu próximo agendamento para utilizar.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Seu progresso</h3>
                    <div className="bg-gray-100 rounded-full h-2.5 mb-2">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (userReward.serviceCount / (rewardSettings?.servicesForReward || 5)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {userReward.serviceCount} de {rewardSettings?.servicesForReward || 5} serviços para ganhar um corte grátis
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Como funciona</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    A cada {rewardSettings?.servicesForReward || 5} serviços realizados, você ganha um corte de cabelo grátis.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Você deve estar logado para acumular cortesias</li>
                    <li>Cada serviço realizado conta 1 ponto para sua cortesia</li>
                    <li>O benefício é válido por 30 dias após ser disponibilizado</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Nenhum benefício encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <User size={24} className="text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold">
            Olá, {user.firstName}!
          </h1>
        </div>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex border-b border-gray-200 min-w-max">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'appointments' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('appointments')}
            >
              <div className="flex items-center">
                <Calendar size={16} className="mr-1.5" />
                Agendamentos
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'rewards' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('rewards')}
            >
              <div className="flex items-center">
                <Award size={16} className="mr-1.5" />
                Benefícios
              </div>
            </button>
            
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'profile' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <div className="flex items-center">
                <User size={16} className="mr-1.5" />
                Meu Perfil
              </div>
            </button>
          </div>
        </div>
        
        <div>
          {activeTab === 'appointments' && renderAppointmentsTab()}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'rewards' && renderRewardsTab()}
        </div>
      </div>
    </div>
  );
};