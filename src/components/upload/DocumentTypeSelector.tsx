import { motion } from 'framer-motion';
import { CreditCard, Car, Truck, Zap, FileText } from 'lucide-react';

const documentTypes = [
  {
    id: 'muqeem',
    label: 'Muqeem (Iqama)',
    description: 'Residence permit for expatriates',
    icon: CreditCard,
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  },
  {
    id: 'driving_license',
    label: 'Driving License',
    description: 'Saudi driving license',
    icon: Car,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  {
    id: 'vehicle_registration',
    label: 'Vehicle Registration',
    description: 'Vehicle registration card',
    icon: Truck,
    color: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  },
  {
    id: 'energy_permit',
    label: 'Energy Permit',
    description: 'Saudi Energy power plan entry permit',
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  {
    id: 'mvpi_certificate',
    label: 'MVPI Certificate',
    description: 'Motor Vehicle Periodic Inspection certificate',
    icon: FileText,
    color: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
];

export default function DocumentTypeSelector({ selected, onSelect }: any) {
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
            className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
              isSelected
                ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-500/5'
                : 'border-slate-100 bg-white hover:border-indigo-600/30 hover:shadow-md'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="doctype-indicator"
                className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600"
              />
            )}
            <div className={`w-12 h-12 rounded-xl ${type.color} border flex items-center justify-center mb-3`}>
              <type.icon className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-slate-800 text-sm">{type.label}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">{type.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
