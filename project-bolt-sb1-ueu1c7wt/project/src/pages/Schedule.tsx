import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TimeSlotPicker } from '../components/ui/TimeSlotPicker';
import { useServiceStore } from '../store/serviceStore';
import { useAppointmentStore } from '../store/appointmentStore';

export const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { selectedServices, clearSelectedServices } = useServiceStore();
  const { 
    selectedDate, 
    selectedTimeSlot, 
    availableSlots, 
    loading,
    setSelectedDate, 
    setSelectedTimeSlot 
  } = useAppointmentStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date();
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      
      // Disable past dates
      const isPastDate = date < today && !(
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
      
      days.push({
        date,
        day,
        isDisabled: isPastDate,
        isToday: 
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const prevMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    ));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    ));
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleContinue = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Por favor, selecione uma data e horário para continuar');
      return;
    }
    navigate('/booking');
  };
  
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Services Summary */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Resumo dos Serviços</h1>
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {selectedServices.map((service) => (
              <div 
                key={service.id} 
                className="flex justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span>{service.name}</span>
                <span>R$ {service.price.toFixed(2)}</span>
              </div>
            ))}
            
            <div className="mt-4 pt-2 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Duração estimada</span>
                <span>{totalDuration} minutos</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Date & Time Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Selecione a Data e Horário</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Data selecionada</p>
              <button
                type="button"
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="flex items-center w-full p-3 border border-gray-300 rounded-md bg-white text-left"
              >
                <Calendar size={18} className="mr-2 text-blue-500" />
                {selectedDate ? (
                  format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                ) : (
                  "Selecione uma data"
                )}
              </button>
              
              {calendarOpen && (
                <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      
                      <h3 className="font-medium">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                      </h3>
                      
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                        <div 
                          key={index}
                          className="text-center text-sm font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => (
                        <div key={index} className="aspect-square">
                          {day ? (
                            <button
                              type="button"
                              disabled={day.isDisabled}
                              onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                              className={`
                                w-full h-full flex items-center justify-center rounded-full text-sm
                                ${day.isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                                ${day.isToday ? 'bg-blue-100 text-blue-700' : ''}
                                ${selectedDate && day.date.toDateString() === selectedDate.toDateString() 
                                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                  : ''}
                              `}
                            >
                              {day.day}
                            </button>
                          ) : (
                            <div className="w-full h-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {selectedDate && (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Clock size={18} className="mr-2 text-blue-500" />
                  <p className="font-medium">Horários disponíveis</p>
                </div>
                
                <TimeSlotPicker
                  timeSlots={availableSlots}
                  selectedTimeSlot={selectedTimeSlot}
                  onSelectTimeSlot={setSelectedTimeSlot}
                  isLoading={loading}
                />
              </div>
            )}
            
            <Button
              onClick={handleContinue}
              isFullWidth
              disabled={!selectedDate || !selectedTimeSlot}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};