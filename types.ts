
import React from 'react';

export type ServiceStatus = 'EM ANDAMENTO' | 'AGUARDANDO PEÇAS' | 'DIAGNÓSTICO' | 'CONCLUÍDO' | 'AGUARDANDO APROVAÇÃO' | 'OUTROS';

export interface WorkshopInfo {
  name: string;
  phone: string;
  address: string;
  logoUrl?: string;
  logoScale?: number;
}

export interface BudgetItem {
  id: string;
  name: string;
  unitPrice: number;
  qty: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  location?: string;
  imageUrl?: string;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
  chassis: string;
  km: string;
  year: string;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  vehicles: Vehicle[];
}

export interface Service {
  id: string;
  customerName: string;
  vehicle: string;
  plate: string;
  description: string;
  executionDescription?: string;
  status: ServiceStatus;
  imageUrl: string;
  budgetItems?: BudgetItem[];
  discount?: number;
  mileage?: string;
  finishedDate?: string;
}

export interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export type TransactionStatus = 'PENDING' | 'CLEARED' | 'BOUNCED';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: 'SERVICE' | 'PARTS' | 'RENT' | 'OTHER';
  method: string;
  time: string;
  date: string;
  isoDate: string;
  status?: TransactionStatus;
}

export type View = 'dashboard' | 'customer_form' | 'vehicle_form' | 'services' | 'settings' | 'budget' | 'new_service' | 'service_execution' | 'payment' | 'finances' | 'reports' | 'inventory';
