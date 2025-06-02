import React from 'react';
import { cn } from '../../utils/cn';
import type { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  onSelectTimeSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  timeSlots,
  selectedTimeSlot,
  onSelectTimeSlot,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-600">Carregando horários disponíveis...</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Não há horários disponíveis para esta data.</p>
        <p className="text-gray-500 mt-1">Por favor, selecione outra data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 py-4">
      {timeSlots.map((slot) => (
        <button
          key={slot.id}
          onClick={() => slot.available ? onSelectTimeSlot(slot) : null}
          disabled={!slot.available}
          className={cn(
            'p-3 rounded-md text-center transition-colors',
            selectedTimeSlot?.id === slot.id
              ? 'bg-blue-500 text-white'
              : slot.available
                ? 'bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
};