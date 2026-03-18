import { X, Building2, Package, Scale, Calendar, Mail, FileText, Clock } from 'lucide-react';
import type { PurchaseOrder } from '../types';
import { formatDate, getStatusColor, getStatusLabel, getDaysUntilDelivery } from '../utils/reminderUtils';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OrderDetailModalProps {
  order: PurchaseOrder;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const daysLeft = getDaysUntilDelivery(order.deliveryDate);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md animate-fade-in border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-gray-100">Sipariş Detayı</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order)}`}>
              {getStatusLabel(order)}
            </span>
            {order.status === 'pending' && daysLeft >= 0 && (
              <span className="text-sm text-gray-500">
                {daysLeft === 0 ? 'Bugün teslim' : `Teslime ${daysLeft} gün`}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Building2 className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Firma</p>
                <p className="text-sm font-medium text-gray-200">{order.companyName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Package className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Ürün</p>
                <p className="text-sm font-medium text-gray-200">{order.productName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Scale className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Miktar / Ağırlık</p>
                <p className="text-sm font-medium text-gray-200">
                  {order.quantity} {order.unit}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Calendar className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Teslimat Tarihi</p>
                <p className="text-sm font-medium text-gray-200">{formatDate(order.deliveryDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Mail className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Hatırlatma E-postası</p>
                <p className="text-sm font-medium text-gray-200">{order.reminderEmail}</p>
                {order.reminderSent && (
                  <p className="text-xs text-emerald-400 mt-1">✓ Hatırlatma gönderildi</p>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <FileText className="w-5 h-5 text-cyan-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Notlar</p>
                  <p className="text-sm text-gray-300">{order.notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Clock className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Oluşturulma</p>
                <p className="text-sm text-gray-300">
                  {format(parseISO(order.createdAt), 'dd MMM yyyy · HH:mm', { locale: tr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
