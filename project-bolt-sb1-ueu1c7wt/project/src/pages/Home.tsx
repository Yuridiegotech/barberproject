import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ServiceCard } from '../components/ui/ServiceCard';
import { useServiceStore } from '../store/serviceStore';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { services, loading, fetchServices, selectedServices, selectService, deselectService } = useServiceStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSchedule = () => {
    if (selectedServices.length === 0) {
      alert('Por favor, selecione pelo menos um serviço para continuar');
      return;
    }
    navigate('/schedule');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Logo & Contact Info */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 text-white">
          <Scissors size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BarberShop</h1>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
          <a 
            href="tel:+1234567890" 
            className="text-blue-600 hover:underline transition-colors"
          >
            (12) 3456-7890
          </a>
          <span className="hidden md:inline text-gray-400">|</span>
          <a 
            href="https://wa.me/1234567890" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline transition-colors"
          >
            WhatsApp
          </a>
          <span className="hidden md:inline text-gray-400">|</span>
          <a 
            href="https://instagram.com/barbershop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline transition-colors"
          >
            @barbershop
          </a>
        </div>
      </div>

      {/* Services Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">Nossos Serviços</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Carregando serviços...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServices.some(s => s.id === service.id)}
                onSelect={() => selectService(service)}
                onDeselect={() => deselectService(service.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">Nenhum serviço disponível no momento.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Selecione um ou mais serviços para agendar
          </p>
          <Button
            onClick={handleSchedule}
            size="lg"
            disabled={selectedServices.length === 0}
            className="group"
          >
            Agendar
            <ChevronRight className="inline ml-1 group-hover:translate-x-1 transition-transform" size={18} />
          </Button>
        </div>
      </section>
    </div>
  );
};