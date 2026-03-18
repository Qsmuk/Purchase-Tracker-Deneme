import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Bell, Package, Download, Upload } from 'lucide-react';
import type { PurchaseOrder, SortField, SortDirection } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getDaysUntilDelivery, generateMailtoLink } from './utils/reminderUtils';
import Dashboard from './components/Dashboard';
import PurchaseForm from './components/PurchaseForm';
import PurchaseTable from './components/PurchaseTable';
import ReminderPanel from './components/ReminderPanel';
import OrderDetailModal from './components/OrderDetailModal';

export default function App() {
  const [orders, setOrders] = useLocalStorage<PurchaseOrder[]>('purchase-orders', []);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('deliveryDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showReminders, setShowReminders] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const reminderCount = orders.filter((o) => {
    if (o.status !== 'pending') return false;
    const days = getDaysUntilDelivery(o.deliveryDate);
    return days <= 3;
  }).length;

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const pendingReminders = orders.filter((o) => {
      if (o.status !== 'pending' || o.reminderSent) return false;
      const days = getDaysUntilDelivery(o.deliveryDate);
      return days <= 3 && days >= 0;
    });

    if (pendingReminders.length > 0) {
      showToast(
        `⚠️ ${pendingReminders.length} sipariş dikkat gerektiriyor! Hatırlatmaları görmek için zile tıklayın.`,
        'warning'
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaveOrder(order: PurchaseOrder) {
    setOrders((prev) => {
      const existing = prev.findIndex((o) => o.id === order.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = order;
        return updated;
      }
      return [...prev, order];
    });
    setShowForm(false);
    setEditingOrder(null);
    showToast(editingOrder ? 'Sipariş güncellendi!' : 'Sipariş eklendi!');
  }

  function handleDeleteOrder(id: string) {
    if (window.confirm('Bu siparişi silmek istediğinize emin misiniz?')) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast('Sipariş silindi.', 'info');
    }
  }

  function handleStatusChange(id: string, status: PurchaseOrder['status']) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    showToast(
      status === 'delivered' ? 'Sipariş teslim edildi olarak işaretlendi! ✅' : 'Sipariş iptal edildi.',
      status === 'delivered' ? 'success' : 'info'
    );
  }

  function handleEditOrder(order: PurchaseOrder) {
    setEditingOrder(order);
    setShowForm(true);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function handleSendReminder(order: PurchaseOrder) {
    const mailtoLink = generateMailtoLink(order);
    window.open(mailtoLink, '_blank');

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, reminderSent: true } : o))
    );
    showToast(`${order.companyName} için hatırlatma e-postası hazırlandı!`, 'success');
  }

  function handleExportData() {
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siparisler-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Veriler başarıyla dışa aktarıldı!');
  }

  function handleImportData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          setOrders(data);
          showToast(`${data.length} sipariş içe aktarıldı!`);
        } else {
          showToast('Geçersiz dosya formatı.', 'warning');
        }
      } catch {
        showToast('Dosya okunurken hata oluştu.', 'warning');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : filterStatus === 'overdue'
      ? orders.filter((o) => o.status === 'pending' && getDaysUntilDelivery(o.deliveryDate) < 0)
      : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#06060a]">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />

      {/* Header */}
      <header className="glass-card border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-glow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Çağatay Satınalma Takip
                </h1>
                <p className="text-[10px] text-gray-600 -mt-0.5 hidden sm:block">
                  Sipariş & Teslimat Yönetimi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReminders(true)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
                title="Hatırlatmalar"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {reminderCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {reminderCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Sipariş</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dashboard */}
        <Dashboard orders={orders} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Firma, ürün veya not ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 focus:ring-2 focus:ring-cyan-500/40 outline-none"
            >
              <option value="all" className="bg-gray-900">Tüm Durumlar</option>
              <option value="pending" className="bg-gray-900">Beklemede</option>
              <option value="delivered" className="bg-gray-900">Teslim Edildi</option>
              <option value="cancelled" className="bg-gray-900">İptal Edildi</option>
              <option value="overdue" className="bg-gray-900">Gecikmiş</option>
            </select>
            <button
              onClick={handleExportData}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              title="Dışa Aktar"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <label className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" title="İçe Aktar">
              <Upload className="w-4 h-4 text-gray-400" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <PurchaseTable
          orders={filteredOrders}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onStatusChange={handleStatusChange}
          onSendReminder={handleSendReminder}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          searchQuery={searchQuery}
          onViewDetail={setViewingOrder}
        />

        {/* Info Banner */}
        <div className="glass-card rounded-xl p-4 gradient-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Bell className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200">Hatırlatmalar Nasıl Çalışır?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Bir siparişin teslimat tarihi 3 gün veya daha az kaldığında hatırlatma ikonu (📧) görünür.
                Tıkladığınızda, sipariş oluştururken belirttiğiniz e-posta adresine önceden doldurulmuş bir
                hatırlatma e-postası açılır. Siparişler otomatik olarak tarayıcınızın yerel depolama alanına kaydedilir.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <PurchaseForm
          onSave={handleSaveOrder}
          onCancel={() => {
            setShowForm(false);
            setEditingOrder(null);
          }}
          editingOrder={editingOrder}
        />
      )}

      {showReminders && (
        <ReminderPanel
          orders={orders}
          onSendReminder={handleSendReminder}
          onDismiss={() => setShowReminders(false)}
          visible={showReminders}
        />
      )}

      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all animate-slide-up border ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : toast.type === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-white/10 text-gray-300 border-white/10'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
