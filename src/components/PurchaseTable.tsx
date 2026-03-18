import { Edit2, Trash2, Mail, CheckCircle, XCircle, ArrowUpDown, Eye } from 'lucide-react';
import type { PurchaseOrder, SortField, SortDirection } from '../types';
import { getStatusColor, getStatusLabel, formatDate, getDaysUntilDelivery, generateMailtoLink } from '../utils/reminderUtils';

interface PurchaseTableProps {
  orders: PurchaseOrder[];
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PurchaseOrder['status']) => void;
  onSendReminder: (order: PurchaseOrder) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  searchQuery: string;
  onViewDetail: (order: PurchaseOrder) => void;
}

export default function PurchaseTable({
  orders,
  onEdit,
  onDelete,
  onStatusChange,
  onSendReminder,
  sortField,
  sortDirection,
  onSort,
  searchQuery,
  onViewDetail,
}: PurchaseTableProps) {
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.companyName.toLowerCase().includes(q) ||
      order.productName.toLowerCase().includes(q) ||
      order.notes.toLowerCase().includes(q)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'companyName':
        comparison = a.companyName.localeCompare(b.companyName);
        break;
      case 'productName':
        comparison = a.productName.localeCompare(b.productName);
        break;
      case 'deliveryDate':
        comparison = new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-cyan-400 transition-colors"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-cyan-400' : 'text-gray-600'}`} />
    </button>
  );

  if (orders.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 mb-4">
          <svg className="w-8 h-8 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-1">Henüz sipariş yok</h3>
        <p className="text-sm text-gray-500">İlk siparişinizi eklemek için "Yeni Sipariş" butonuna tıklayın.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left px-4 py-3">
                <SortButton field="companyName" label="Firma" />
              </th>
              <th className="text-left px-4 py-3">
                <SortButton field="productName" label="Ürün" />
              </th>
              <th className="text-left px-4 py-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Miktar</span>
              </th>
              <th className="text-left px-4 py-3">
                <SortButton field="deliveryDate" label="Teslimat" />
              </th>
              <th className="text-left px-4 py-3">
                <SortButton field="status" label="Durum" />
              </th>
              <th className="text-right px-4 py-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => {
              const daysLeft = getDaysUntilDelivery(order.deliveryDate);
              const showReminder = order.status === 'pending' && daysLeft <= 3 && daysLeft >= 0;
              return (
                <tr
                  key={order.id}
                  className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-200">{order.companyName}</p>
                    <p className="text-xs text-gray-600 truncate max-w-[150px]">{order.reminderEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">{order.productName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">
                      {order.quantity} <span className="text-gray-500">{order.unit}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">{formatDate(order.deliveryDate)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order)}`}
                    >
                      {getStatusLabel(order)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {showReminder && (
                        <a
                          href={generateMailtoLink(order)}
                          onClick={(e) => {
                            e.preventDefault();
                            onSendReminder(order);
                          }}
                          title="Hatırlatma Gönder"
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onViewDetail(order)}
                        title="Detay Görüntüle"
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(order)}
                        title="Düzenle"
                        className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-cyan-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => onStatusChange(order.id, 'delivered')}
                          title="Teslim Edildi"
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => onStatusChange(order.id, 'cancelled')}
                          title="İptal Et"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(order.id)}
                        title="Sil"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/[0.03]">
        {sortedOrders.map((order) => {
          const daysLeft = getDaysUntilDelivery(order.deliveryDate);
          const showReminder = order.status === 'pending' && daysLeft <= 3 && daysLeft >= 0;
          return (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-200">{order.companyName}</p>
                  <p className="text-sm text-gray-400">{order.productName}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order)}`}
                >
                  {getStatusLabel(order)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{order.quantity} {order.unit}</span>
                <span>📅 {formatDate(order.deliveryDate)}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {showReminder && (
                  <button
                    onClick={() => onSendReminder(order)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20"
                  >
                    📧 Hatırlat
                  </button>
                )}
                <button
                  onClick={() => onViewDetail(order)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 font-medium border border-white/10"
                >
                  Detay
                </button>
                <button
                  onClick={() => onEdit(order)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20"
                >
                  Düzenle
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => onStatusChange(order.id, 'delivered')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20"
                  >
                    ✓ Teslim
                  </button>
                )}
                <button
                  onClick={() => onDelete(order.id)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 font-medium border border-red-500/20"
                >
                  Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && orders.length > 0 && (
        <div className="p-8 text-center text-sm text-gray-500">
          Aramanızla eşleşen sipariş bulunamadı.
        </div>
      )}
    </div>
  );
}
