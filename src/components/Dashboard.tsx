import { Package, Clock, AlertTriangle, CheckCircle, Truck } from 'lucide-react';
import type { PurchaseOrder } from '../types';
import { getDaysUntilDelivery, isOverdue } from '../utils/reminderUtils';

interface DashboardProps {
  orders: PurchaseOrder[];
}

export default function Dashboard({ orders }: DashboardProps) {
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'pending' && !isOverdue(o)).length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const overdue = orders.filter(o => isOverdue(o)).length;
  const upcoming = orders.filter(o => {
    if (o.status !== 'pending') return false;
    const days = getDaysUntilDelivery(o.deliveryDate);
    return days >= 0 && days <= 3;
  }).length;

  const stats = [
    {
      label: 'Toplam Sipariş',
      value: total,
      icon: Package,
      gradient: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
    },
    {
      label: 'Beklemede',
      value: pending,
      icon: Clock,
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Yaklaşan (≤3 gün)',
      value: upcoming,
      icon: Truck,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Gecikmiş',
      value: overdue,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-pink-500',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
    },
    {
      label: 'Teslim Edildi',
      value: delivered,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card rounded-xl p-4 hover:border-white/10 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
