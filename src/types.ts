export interface PurchaseOrder {
  id: string;
  companyName: string;
  productName: string;
  quantity: string;
  unit: 'pieces' | 'kg' | 'liters' | 'meters' | 'boxes' | 'tons' | 'other';
  deliveryDate: string; // ISO date string
  reminderEmail: string;
  notes: string;
  status: 'pending' | 'delivered' | 'cancelled';
  reminderSent: boolean;
  createdAt: string;
}

export type SortField = 'companyName' | 'productName' | 'deliveryDate' | 'status' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
