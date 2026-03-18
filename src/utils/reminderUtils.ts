import { differenceInDays, parseISO, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { PurchaseOrder } from '../types';

export function getDaysUntilDelivery(deliveryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = parseISO(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  return differenceInDays(delivery, today);
}

export function shouldSendReminder(order: PurchaseOrder): boolean {
  if (order.status !== 'pending' || order.reminderSent) return false;
  const daysLeft = getDaysUntilDelivery(order.deliveryDate);
  return daysLeft <= 3 && daysLeft >= 0;
}

export function isOverdue(order: PurchaseOrder): boolean {
  if (order.status !== 'pending') return false;
  return getDaysUntilDelivery(order.deliveryDate) < 0;
}

export function getStatusColor(order: PurchaseOrder): string {
  if (order.status === 'delivered') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (order.status === 'cancelled') return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  if (isOverdue(order)) return 'text-red-400 bg-red-500/10 border-red-500/30';
  const daysLeft = getDaysUntilDelivery(order.deliveryDate);
  if (daysLeft <= 3) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
}

export function getStatusLabel(order: PurchaseOrder): string {
  if (order.status === 'delivered') return 'Teslim Edildi';
  if (order.status === 'cancelled') return 'İptal Edildi';
  if (isOverdue(order)) return 'Gecikmiş';
  const daysLeft = getDaysUntilDelivery(order.deliveryDate);
  if (daysLeft === 0) return 'Bugün';
  if (daysLeft === 1) return '1 gün kaldı';
  if (daysLeft <= 3) return `${daysLeft} gün kaldı`;
  return 'Beklemede';
}

export function generateMailtoLink(order: PurchaseOrder): string {
  const subject = encodeURIComponent(`Teslimat Hatırlatması: ${order.productName} - ${order.companyName}`);
  const formattedDate = format(parseISO(order.deliveryDate), 'dd MMMM yyyy', { locale: tr });
  const body = encodeURIComponent(
    `Merhaba,\n\nAşağıdaki siparişin teslimat tarihi ${formattedDate} olarak planlanmıştır:\n\n` +
    `Firma: ${order.companyName}\n` +
    `Ürün: ${order.productName}\n` +
    `Miktar: ${order.quantity} ${order.unit}\n` +
    `Teslimat Tarihi: ${formattedDate}\n` +
    `${order.notes ? `Notlar: ${order.notes}\n` : ''}` +
    `\nLütfen teslimat için gerekli hazırlıkların yapıldığından emin olunuz.\n\nSaygılarımızla`
  );
  return `mailto:${order.reminderEmail}?subject=${subject}&body=${body}`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy', { locale: tr });
}
