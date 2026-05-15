import React from 'react';
import { SubViewType } from '../../components/layout/Sidebar';
import { FinancialReport } from '../../components/reports/FinancialReport';
import { InventoryReport } from '../../components/reports/InventoryReport';
import { SalesReport } from '../../components/reports/SalesReport';
import { PurchasingReport } from '../../components/reports/PurchasingReport';
import { usePermission } from '../../hooks/permissions';

interface ReportsModuleProps {
  activeView: SubViewType;
}

export function ReportsModule({ activeView }: ReportsModuleProps) {
  const { hasPermission } = usePermission();

  return (
    <div className="fade-in">
      {activeView === 'financials' && <FinancialReport />}
      {activeView === 'inventory-report' && <InventoryReport />}
      {activeView === 'sales-report' && <SalesReport />}
      {activeView === 'purchasing-report' && <PurchasingReport />}
    </div>
  );
}
