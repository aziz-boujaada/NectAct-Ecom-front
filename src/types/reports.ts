export type FinancialReport = {
  status: string;
  message?: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    income_statement: {
      revenue: string;
      refunds: string;
      net_revenue: string;
      confirmed_purchases: string;
      estimated_gross_profit: string;
    };
    balance_sheet: {
      assets: {
        cash: string;
        accounts_receivable: string;
        inventory: string;
      };
      liabilities: {
        pending_purchase_orders: string;
      };
      equity: {
        estimated_retained_earnings: string;
      };
    };
    cash_flow_statement: {
      cash_inflows: {
        customer_payments: string;
      };
      cash_outflows: {
        refunds: string;
        confirmed_purchases: string;
      };
      net_cash_flow: string;
    };
    general_ledger: Array<{
      account: string;
      debit: string;
      credit: string;
    }>;
  };
};

export type InventoryReport = {
  status: string;
  message?: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    stock_levels: {
      total_products: number;
      total_units: number;
      out_of_stock_products: number;
      low_stock_products: number;
      items: Array<{
        id: number;
        reference: string;
        name: string;
        stock: number;
        min_stock: number;
        alert_stock: number;
      }>;
    };
    inventory_valuation: {
      total_value: string;
      items: Array<{
        id: number;
        reference: string;
        name: string;
        stock: number;
        average_cost: string;
        inventory_value: string;
      }>;
    };
    turnover_rates: Array<{
      id: number;
      reference: string;
      name: string;
      sold_quantity: number;
      current_stock: number;
      turnover_rate: string;
      sales_total: string;
    }>;
    warehouse_efficiency: {
      movement_throughput: string;
      active_sku_ratio: string;
      low_stock_ratio: string;
    };
  };
};

export type SalesReport = {
  status: string;
  message?: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    sales_volume_by_region: Array<{
      region: string;
      order_count: number;
      sales_total: string;
    }>;
    product_performance: Array<{
      id: number;
      reference: string;
      name: string;
      quantity_sold: number;
      sales_total: string;
    }>;
    sales_trends: Array<{
      date: string;
      order_count: number;
      sales_total: string;
    }>;
  };
};

export type PurchasingReport = {
  status: string;
  message?: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    supplier_performance: Array<{
      id: number;
      name: string;
      purchase_count: number;
      confirmed_spend: string;
      pending_spend: string;
      average_order_value: string;
    }>;
    pending_purchase_orders: Array<{
      id: number;
      supplier: string | null;
      total: string;
      status: 'pending';
      created_at: string;
    }>;
    expenditure_analysis: {
      total_spend: string;
      by_category: Array<{
        category: string;
        total_spend: string;
      }>;
      top_products: Array<{
        id: number;
        name: string;
        quantity: number;
        total_spend: string;
      }>;
    };
  };
};
