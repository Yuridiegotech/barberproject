import React from 'react';
import { Instagram, Phone, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">BarberShop</h3>
            <p className="text-gray-400">O melhor em serviços de barbearia</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Phone size={18} className="text-blue-400" />
              <a href="tel:+1234567890" className="hover:underline">
                (12) 3456-7890
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare size={18} className="text-green-400" />
              <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                WhatsApp
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Instagram size={18} className="text-pink-400" />
              <a 
                href="https://instagram.com/barbershop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @barbershop
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} BarberShop. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};