import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PurchaseOrder } from '../types';

interface PurchaseFormProps {
  onSave: (order: PurchaseOrder) => void;
  onCancel: () => void;
  editingOrder: PurchaseOrder | null;
}

const UNITS = [
  { value: 'adet', label: 'Adet' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'litre', label: 'Litre' },
  { value: 'metre', label: 'Metre' },
  { value: 'kutu', label: 'Kutu' },
  { value: 'ton', label: 'Ton' },
  { value: 'diğer', label: 'Diğer' },
] as const;

export default function PurchaseForm({ onSave, onCancel, editingOrder }: PurchaseFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<PurchaseOrder['unit']>('pieces');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingOrder) {
      setCompanyName(editingOrder.companyName);
      setProductName(editingOrder.productName);
      setQuantity(editingOrder.quantity);
      setUnit(editingOrder.unit);
      setDeliveryDate(editingOrder.deliveryDate);
      setReminderEmail(editingOrder.reminderEmail);
      setNotes(editingOrder.notes);
    }
  }, [editingOrder]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = 'Firma adı gereklidir';
    if (!productName.trim()) newErrors.productName = 'Ürün adı gereklidir';
    if (!quantity.trim()) newErrors.quantity = 'Miktar gereklidir';
    if (!deliveryDate) newErrors.deliveryDate = 'Teslimat tarihi gereklidir';
    if (!reminderEmail.trim()) {
      newErrors.reminderEmail = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reminderEmail)) {
      newErrors.reminderEmail = 'Geçersiz e-posta formatı';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const order: PurchaseOrder = {
      id: editingOrder?.id || uuidv4(),
      companyName: companyName.trim(),
      productName: productName.trim(),
      quantity: quantity.trim(),
      unit,
      deliveryDate,
      reminderEmail: reminderEmail.trim(),
      notes: notes.trim(),
      status: editingOrder?.status || 'pending',
      reminderSent: editingOrder?.reminderSent || false,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
    };
    onSave(order);
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-lg border ${
      errors[field]
        ? 'border-red-500/50 bg-red-500/5 text-red-300'
        : 'border-white/10 bg-white/5 text-gray-100'
    } text-sm focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 outline-none transition-all placeholder:text-gray-600`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-gray-100">
            {editingOrder ? 'Siparişi Düzenle' : 'Yeni Sipariş Ekle'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Firma Adı *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ör: ABC Tedarik A.Ş."
              className={inputClass('companyName')}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-red-400">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Ürün Adı *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ör: M10 Çelik Cıvata"
              className={inputClass('productName')}
            />
            {errors.productName && (
              <p className="mt-1 text-xs text-red-400">{errors.productName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Miktar / Ağırlık *
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ör: 500"
                className={inputClass('quantity')}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-400">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Birim
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as PurchaseOrder['unit'])}
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-100 text-sm focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 outline-none transition-all"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value} className="bg-gray-900 text-gray-100">
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Teslimat Tarihi *
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className={inputClass('deliveryDate')}
            />
            {errors.deliveryDate && (
              <p className="mt-1 text-xs text-red-400">{errors.deliveryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Hatırlatma E-postası *
            </label>
            <input
              type="email"
              value={reminderEmail}
              onChange={(e) => setReminderEmail(e.target.value)}
              placeholder="Ör: yonetici@firma.com"
              className={inputClass('reminderEmail')}
            />
            {errors.reminderEmail && (
              <p className="mt-1 text-xs text-red-400">{errors.reminderEmail}</p>
            )}
            <p className="mt-1 text-xs text-gray-600">
              Teslimat tarihinden 3 gün önce hatırlatma gönderilecek
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Notlar (isteğe bağlı)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ek notlarınız..."
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-100 text-sm focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 outline-none transition-all resize-none placeholder:text-gray-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {editingOrder ? (
                <>
                  <Save className="w-4 h-4" /> Güncelle
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
