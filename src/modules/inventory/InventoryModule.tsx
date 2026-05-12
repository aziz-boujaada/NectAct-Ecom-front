import React from 'react';
import { CategoryManager } from '../../components/dashboard/CategoryManager';
import { ProductManager } from '../../components/dashboard/ProductManager';
import StockMovements from '../../components/dashboard/StockHistory';
import { SubViewType } from '../../components/layout/Sidebar';

interface InventoryModuleProps {
  activeView: SubViewType;
  catalog: any; // Using existing catalog hook return type for now
  onTabChange?: (tab: any) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ activeView, catalog, onTabChange }) => {
  return (
    <div className="fade-in">
      {activeView === 'categories' && (
        <CategoryManager
          categories={catalog.categories}
          editingCategory={catalog.editingCategory}
          form={catalog.categoryForm}
          loading={catalog.loading}
          isAdding={catalog.isAddingCategory}
          onAdd={catalog.startAddingCategory}
          onCancelEdit={catalog.cancelCategoryEdit}
          onChange={catalog.setCategoryForm}
          onDelete={catalog.handleDeleteCategory}
          onEdit={catalog.editCategory}
          onSubmit={catalog.handleCategorySubmit}
        />
      )}

      {activeView === 'products' && (
        <ProductManager
          categories={catalog.categories}
          editingProduct={catalog.editingProduct}
          form={catalog.productForm}
          loading={catalog.loading}
          products={catalog.products}
          suppliers={catalog.suppliers}
          isAdding={catalog.isAddingProduct}
          onAdd={catalog.startAddingProduct}
          onCancelEdit={catalog.cancelProductEdit}
          onChange={catalog.setProductForm}
          onDelete={catalog.handleDeleteProduct}
          onEdit={catalog.editProduct}
          onSubmit={catalog.handleProductSubmit}
          onCreateCategory={catalog.startAddingCategory}
          onCreateSupplier={catalog.startAddingSupplier}
          onTabChange={onTabChange}
        />
      )}

      {activeView === 'stock' && (
        <div className="admin-section fade-in">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inventory</p>
              <h2>Stock Movements</h2>
            </div>
          </div>
          <StockMovements />
        </div>
      )}
    </div>
  );
};
