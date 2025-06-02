import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import type { AvailableSlot } from '../../types';
import toast from 'react-hot-toast';

export const AdminSchedule: React.FC = () => {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  useEffect(() => {
    fetchSlots();
  }, []);
  
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('available_slots')
        .select('*')
        .order('day_of_week')
        .order('start_time');
      
      if (error) throw error;
      
      // Map the snake_case properties to camelCase
      const formattedSlots: AvailableSlot[] = (data || []).map(slot => ({
        id: slot.id,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available
      }));
      
      setSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setDayOfWeek('0');
    setStartTime('');
    setEndTime('');
    setIsAvailable(true);
    setIsAdding(false);
    setEditingSlotId(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      const dayOfWeekValue = parseInt(dayOfWeek);
      
      if (editingSlotId) {
        const { error } = await supabase
          .from('available_slots')
          .update({
            day_of_week: dayOfWeekValue,
            start_time: startTime,
            end_time: endTime,
            is_available: isAvailable
          })
          .eq('id', editingSlotId);
        
        if (error) throw error;
        
        toast.success('Horário atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('available_slots')
          .insert({
            day_of_week: dayOfWeekValue,
            start_time: startTime,
            end_time: endTime,
            is_available: isAvailable
          });
        
        if (error) throw error;
        
        toast.success('Horário adicionado com sucesso!');
      }
      
      resetForm();
      fetchSlots();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    }
  };
  
  const handleEdit = (slot: AvailableSlot) => {
    setDayOfWeek(slot.dayOfWeek.toString());
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setIsAvailable(slot.isAvailable);
    setEditingSlotId(slot.id);
    setIsAdding(true);
  };
  
  const handleDelete = async (slotId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        const { error } = await supabase
          .from('available_slots')
          .delete()
          .eq('id', slotId);
        
        if (error) throw error;
        
        toast.success('Horário excluído com sucesso!');
        fetchSlots();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Ocorreu um erro ao excluir o horário.');
      }
    }
  };
  
  const toggleAvailability = async (slot: AvailableSlot) => {
    try {
      const { error } = await supabase
        .from('available_slots')
        .update({
          is_available: !slot.isAvailable
        })
        .eq('id', slot.id);
      
      if (error) throw error;
      
      toast.success(`Horário ${!slot.isAvailable ? 'ativado' : 'desativado'} com sucesso!`);
      fetchSlots();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gerenciar Horários</h2>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Adicionar Horário
          </Button>
        )}
      </div>
      
      {isAdding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingSlotId ? 'Editar Horário' : 'Novo Horário'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                  Dia da semana
                </label>
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <div className="w-1/2">
                  <Input
                    label="Horário início"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                
                <div className="w-1/2">
                  <Input
                    label="Horário fim"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="isAvailable"
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                Disponível para agendamento
              </label>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={loading}>
                {editingSlotId ? 'Atualizar' : 'Adicionar'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
              <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Carregando horários...</p>
          </div>
        ) : slots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
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
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dayNames[slot.dayOfWeek]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAvailability(slot)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          slot.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {slot.isAvailable ? 'Disponível' : 'Indisponível'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(slot)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(slot.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhum horário cadastrado.</p>
            <Button onClick={() => setIsAdding(true)} size="sm">
              Adicionar horário
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};