import { Card } from '@/components/ui/card';

export default function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="p-6 flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
        <h4 className="text-2xl font-black mt-1 text-slate-800">{value}</h4>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} border`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </Card>
  );
}
