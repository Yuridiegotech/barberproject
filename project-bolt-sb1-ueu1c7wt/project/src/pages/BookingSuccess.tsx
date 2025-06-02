import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useServiceStore } from '../store/serviceStore';

export const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { clearSelectedServices } = useServiceStore();
  
  useEffect(() => {
    // Clear selected services when arriving on success page
    clearSelectedServices();
  }, [clearSelectedServices]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Agendamento Confirmado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Seu agendamento foi realizado com sucesso. Enviaremos uma confirmação para o seu telefone.
        </p>
        
        <div className="py-4 px-6 bg-gray-50 rounded-lg mb-6 text-left">
          <div className="flex items-center">
            <Calendar size={18} className="text-blue-500 mr-2" />
            <p className="font-medium">Detalhes do agendamento</p>
          </div>
          <p className="mt-2 text-gray-600">
            Você receberá uma mensagem com todas as informações do seu agendamento.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            isFullWidth
            className="group"
          >
            Voltar para a Página Inicial
            <ArrowRight className="inline ml-1 group-hover:translate-x-1 transition-transform" size={16} />
          </Button>
          
          <Button
            onClick={() => navigate('/client')}
            variant="outline"
            isFullWidth
          >
            Ver Meus Agendamentos
          </Button>
        </div>
      </div>
    </div>
  );
};