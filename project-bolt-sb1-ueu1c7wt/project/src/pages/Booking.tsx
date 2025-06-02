import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ServiceCard } from '../components/ui/ServiceCard';
import { useServiceStore } from '../store/serviceStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { selectedServices } = useServiceStore();
  const { selectedDate, selectedTimeSlot, createAppointment } = useAppointmentStore();
  const { user } = useAuthStore();
  
  const [withAccount, setWithAccount] = useState(!!user);
  const [clientName, setClientName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
  );
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleBack = () => {
    navigate('/schedule');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Por favor, selecione uma data e horário');
      return;
    }
    
    if (!clientName.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }
    
    if (!clientPhone.trim()) {
      toast.error('Por favor, informe seu telefone');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await createAppointment(
        {
          userId: user?.id,
          clientName,
          clientPhone,
          services: selectedServices,
        },
        withAccount
      );
      
      if (success) {
        toast.success('Agendamento realizado com sucesso!');
        navigate('/success');
      } else {
        toast.error('Erro ao realizar o agendamento. Tente novamente.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro. Tente novamente mais tarde.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  
  if (!selectedDate || !selectedTimeSlot) {
    navigate('/schedule');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Finalizar Agendamento</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Resumo</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar size={18} className="mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Data</p>
                <p className="text-gray-600">
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={18} className="mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Horário</p>
                <p className="text-gray-600">{selectedTimeSlot.time}</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Serviços selecionados</p>
              <div className="space-y-2">
                {selectedServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={true}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    showActions={false}
                  />
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-medium mb-4">Informações de Contato</h2>
            
            {!user && (
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle size={18} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Agende com uma conta</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Ao criar uma conta, você poderá acumular cortesias e visualizar seu histórico de serviços.
                    </p>
                    <div className="mt-3 flex gap-3">
                      <Button
                        type="button"
                        variant={withAccount ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => navigate('/login')}
                      >
                        Fazer Login
                      </Button>
                      
                      <Button
                        type="button"
                        variant={!withAccount ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setWithAccount(false)}
                      >
                        Continuar sem conta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <Input
                label="Nome completo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                disabled={isSubmitting}
              />
              
              <Input
                label="Telefone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                isFullWidth
                size="lg"
                isLoading={isSubmitting}
              >
                Confirmar Agendamento
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};