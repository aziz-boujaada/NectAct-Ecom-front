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
      net_profit: string;
    };
    refunds_summary: {
      refunds_total_all_time: string;
      refunds_period: string;
      refunds_today: string;
      refunds_month: string;
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

export type DevisReport = {
  status: string;
  message?: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    total_devis: number;
    status_distribution: {
      draft: number;
      sent: number;
      accepted: number;
      rejected: number;
      expired: number;
    };
    financial_aggregations: {
      draft_total: string;
      sent_total: string;
      accepted_total: string;
      rejected_total: string;
      expired_total: string;
    };
    conversion_metrics: {
      acceptance_rate: number;
      conversion_to_sale_rate: number;
    };
    pipeline_metrics: {
      sent_pending: number;
      sent_total_value: string;
    };
    lost_opportunity_metrics: {
      rejected_count: number;
      rejected_total: string;
      expired_count: number;
      expired_total: string;
      lost_total: string;
    };
    aging_metrics: {
      sent_over_7_days: number;
      sent_over_30_days: number;
    };
  };
};
