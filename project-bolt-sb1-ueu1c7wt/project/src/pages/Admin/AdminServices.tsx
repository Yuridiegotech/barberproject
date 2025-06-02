import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useServiceStore } from '../../store/serviceStore';
import toast from 'react-hot-toast';

export const AdminServices: React.FC = () => {
  const { services, loading, error, fetchServices, addService, updateService, deleteService } = useServiceStore();
  
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setDuration('');
    setIsAddingService(false);
    setEditingServiceId(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price.trim() || !duration.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const priceValue = parseFloat(price);
    const durationValue = parseInt(duration);
    
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Por favor, insira um preço válido');
      return;
    }
    
    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error('Por favor, insira uma duração válida');
      return;
    }
    
    try {
      if (editingServiceId) {
        await updateService(editingServiceId, {
          name,
          price: priceValue,
          description: description || null,
          duration: durationValue
        });
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await addService({
          name,
          price: priceValue,
          description: description || null,
          duration: durationValue
        });
        toast.success('Serviço adicionado com sucesso!');
      }
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    }
  };
  
  const handleEdit = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setName(service.name);
    setPrice(service.price.toString());
    setDescription(service.description || '');
    setDuration(service.duration.toString());
    setEditingServiceId(serviceId);
    setIsAddingService(true);
  };
  
  const handleDelete = async (serviceId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService(serviceId);
        toast.success('Serviço excluído com sucesso!');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Ocorreu um erro ao excluir o serviço.');
      }
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gerenciar Serviços</h2>
        {!isAddingService && (
          <Button 
            onClick={() => setIsAddingService(true)}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Adicionar Serviço
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}
      
      {isAddingService ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingServiceId ? 'Editar Serviço' : 'Novo Serviço'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do serviço"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte de Cabelo"
              required
            />
            
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
            
            <Input
              label="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição do serviço"
            />
            
            <Input
              label="Duração (minutos)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              required
            />
            
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={loading}>
                {editingServiceId ? 'Atualizar' : 'Adicionar'}
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
      ) : null}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && !isAddingService ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Carregando serviços...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="min-w-full divide-y divide-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-500">{service.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.duration} minutos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {service.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
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
            <p className="text-gray-600 mb-4">Nenhum serviço cadastrado.</p>
            <Button onClick={() => setIsAddingService(true)} size="sm">
              Adicionar serviço
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};