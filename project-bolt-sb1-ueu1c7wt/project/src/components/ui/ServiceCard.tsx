import React from 'react';
import { Check, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  showActions?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  onSelect,
  onDeselect,
  showActions = true
}) => {
  const handleToggle = () => {
    if (isSelected) {
      onDeselect();
    } else {
      onSelect();
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-lg transition-all duration-200 border shadow-sm",
        isSelected 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{service.name}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{service.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">
            R$ {service.price.toFixed(2)}
          </p>
          {showActions && (
            <button
              type="button"
              onClick={handleToggle}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                isSelected 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {isSelected ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
            </button>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-2">
        <span>Duração: {service.duration} minutos</span>
      </div>
    </div>
  );
};