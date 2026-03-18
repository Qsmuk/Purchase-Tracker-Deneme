import { Bell, Mail, X, ExternalLink } from 'lucide-react';
import type { PurchaseOrder } from '../types';
import { getDaysUntilDelivery, isOverdue, formatDate, generateMailtoLink } from '../utils/reminderUtils';

interface ReminderPanelProps {
  orders: PurchaseOrder[];
  onSendReminder: (order: PurchaseOrder) => void;
  onDismiss: () => void;
  visible: boolean;
}

export default function ReminderPanel({ orders, onSendReminder, onDismiss, visible }: ReminderPanelProps) {
  const upcomingOrders = orders.filter(
    (o) => o.status === 'pending' && getDaysUntilDelivery(o.deliveryDate) <= 3 && getDaysUntilDelivery(o.deliveryDate) >= 0
  );
  const overdueOrders = orders.filter((o) => isOverdue(o));

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-end p-4">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto mt-16 mr-2 animate-fade-in border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-gray-100">Hatırlatmalar</h2>
          </div>
          <button onClick={onDismiss} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {overdueOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Gecikmiş ({overdueOrders.length})
              </h3>
              <div className="space-y-2">
                {overdueOrders.map((order) => (
                  <div key={order.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm font-medium text-red-300">{order.productName}</p>
                    <p className="text-xs text-red-400/70 mt-0.5">
                      {order.companyName} · Teslim: {formatDate(order.deliveryDate)}
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      {Math.abs(getDaysUntilDelivery(order.deliveryDate))} gün gecikmiş
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Yaklaşan Teslimatlar ({upcomingOrders.length})
              </h3>
              <div className="space-y-2">
                {upcomingOrders.map((order) => {
                  const daysLeft = getDaysUntilDelivery(order.deliveryDate);
                  return (
                    <div key={order.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-300">{order.productName}</p>
                          <p className="text-xs text-amber-400/70 mt-0.5">
                            {order.companyName} · {order.quantity} {order.unit}
                          </p>
                          <p className="text-xs text-amber-400 mt-1">
                            {daysLeft === 0 ? 'Bugün teslim edilecek!' : `${daysLeft} gün kaldı`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={generateMailtoLink(order)}
                            className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors"
                            title="E-posta istemcisinde aç"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => onSendReminder(order)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              order.reminderSent
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'hover:bg-amber-500/20 text-amber-400'
                            }`}
                            title={order.reminderSent ? 'Hatırlatma gönderildi' : 'Hatırlatma gönder'}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {order.reminderSent && (
                        <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                          ✓ Hatırlatma gönderildi
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingOrders.length === 0 && overdueOrders.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Yaklaşan hatırlatma yok</p>
              <p className="text-xs text-gray-600 mt-1">
                Hatırlatmalar teslimat tarihinden 3 gün önce görünür
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
