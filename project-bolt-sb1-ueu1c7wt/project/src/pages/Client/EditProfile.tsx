import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuthStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !phone) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      await updateProfile({
        firstName,
        lastName,
        phone
      });
      
      toast.success('Perfil atualizado com sucesso!');
      navigate('/client');
    } catch (err) {
      console.error(err);
      // Error is handled by the auth store
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/client')}
            className="mr-2"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-xl font-semibold">Editar Perfil</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Seu nome"
              required
            />
            
            <Input
              label="Sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Seu sobrenome"
              required
            />
            
            <Input
              label="Email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
            
            <div className="pt-2 flex space-x-3">
              <Button
                type="submit"
                isLoading={loading}
              >
                Salvar Alterações
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/client')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};