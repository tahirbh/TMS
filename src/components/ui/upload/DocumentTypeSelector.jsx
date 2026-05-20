import React from 'react';  
import { motion } from 'framer-motion';
import { CreditCard, Car, Truck, Zap } from 'lucide-react';

const documentTypes = [
  {
    id: 'muqeem',
    label: 'Muqeem (Iqama)',
    description: 'Residence permit for expatriates',
    icon: CreditCard,
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'driving_license',
    label: 'Driving License',
    description: 'Saudi driving license',
    icon: Car,
    color: 'bg-accent/10 text-accent border-accent/20',
  },
  {
    id: 'vehicle_registration',
    label: 'Vehicle Registration',
    description: 'Vehicle registration card',
    icon: Truck,
    color: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  },
  {
    id: 'energy_permit',
    label: 'Energy Permit',
    description: 'Saudi Energy power plan entry permit',
    icon: Zap,
    color: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  },
];

export default function DocumentTypeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {documentTypes.map((type) => {
        const isSelected = selected === type.id;
        return (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(type.id)}
            className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="doctype-indicator"
                className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary"
              />
            )}
            <div className={`w-12 h-12 rounded-xl ${type.color} border flex items-center justify-center mb-3`}>
              <type.icon className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-foreground">{type.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}