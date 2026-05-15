import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, Edit3, Package, Plus, Trash2, Upload } from "lucide-react";
import type {
  Category,
  Product,
  ProductFormValues,
  Supplier,
} from "../../types";
import { ProductForm } from "./forms/ProductForm";
import { usePagination } from "./hooks/usePagination";
import { PaginationControls } from "./PaginationControls";
import { Can } from "../../context/PermissionContext";
import PermissionButton from "../permissions/PermissionButton";
import { PageHeader } from "../crud/PageHeader";
import { DataTable } from "../crud/DataTable";
import { Badge } from "../common/Badge";
import { formatCurrency } from "../../utils/currency";
import { exportProductsCsv, importProductsCsv } from "../../api/catalog";

type ProductManagerProps = {
  categories: Category[];
  editingProduct: Product | null;
  form: ProductFormValues;
  loading: boolean;
  products: Product[];
  suppliers: Supplier[];
  isAdding: boolean;
  onAdd: () => void;
  onCancelEdit: () => void;
  onChange: (form: ProductFormValues) => void;
  onDelete: (product: Product) => void;
  onEdit: (product: Product) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCreateCategory?: () => void;
  onCreateSupplier?: () => void;
  onTabChange?: (tab: string) => void;
};

export function ProductManager({
  categories,
  editingProduct,
  form,
  loading,
  products,
  suppliers,
  isAdding,
  onAdd,
  onCancelEdit,
  onChange,
  onDelete,
  onEdit,
  onSubmit,
  onCreateCategory,
  onCreateSupplier,
  onTabChange,
}: ProductManagerProps) {
  const [referenceFilter, setReferenceFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const missingRelations = categories.length === 0 || suppliers.length === 0;
  const showForm = isAdding || editingProduct !== null;
  const filteredProducts = useMemo(() => {
    const normalizedReference = referenceFilter.trim().toLowerCase();
    const normalizedName = nameFilter.trim().toLowerCase();

    return products.filter((product) => {
      const referenceMatches =
        normalizedReference.length === 0 ||
        (product.reference ?? "").toLowerCase().includes(normalizedReference);

      const nameMatches =
        normalizedName.length === 0 ||
        product.name.toLowerCase().includes(normalizedName);

      const categoryMatches =
        categoryFilter === "all" ||
        String(product.category?.id ?? product.category_id ?? "") === categoryFilter;

      const supplierMatches =
        supplierFilter === "all" ||
        String(product.supplier?.id ?? product.supplier_id ?? "") === supplierFilter;

      const stock = Number(product.stock ?? 0);
      const minStock = Number(product.min_stock ?? 0);
      const stockStatus =
        stock === 0 ? "out-of-stock" : stock <= minStock ? "low-stock" : "in-stock";

      const stockMatches = stockFilter === "all" || stockStatus === stockFilter;

      return referenceMatches && nameMatches && categoryMatches && supplierMatches && stockMatches;
    });
  }, [products, referenceFilter, nameFilter, categoryFilter, supplierFilter, stockFilter]);

  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(filteredProducts);

  useEffect(() => {
    goToPage(1);
  }, [referenceFilter, nameFilter, categoryFilter, supplierFilter, stockFilter, goToPage]);
  
  const handleCreateCategory = () => {
    onTabChange?.("categories");
    onCreateCategory?.();
  };

  const handleCreateSupplier = () => {
    onTabChange?.("suppliers");
    onCreateSupplier?.();
  };

  const clearFilters = () => {
    setReferenceFilter("");
    setNameFilter("");
    setCategoryFilter("all");
    setSupplierFilter("all");
    setStockFilter("all");
  };

  const handleExportCsv = async () => {
    try {
      const { blob, filename } = await exportProductsCsv();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Failed to export CSV. See console for details.");
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importProductsCsv(file);
      alert('Import successful. The page will reload to reflect changes.');
      window.location.reload();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err?.message || 'Failed to import CSV. See console for details.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const tableHeaders = ["ID", "Image", "Reference", "Product", "Category", "Supplier", "Price", "Stock", "Actions"];
  const hasActiveFilters =
    referenceFilter.trim().length > 0 ||
    nameFilter.trim().length > 0 ||
    categoryFilter !== "all" ||
    supplierFilter !== "all" ||
    stockFilter !== "all";
  
  return (
    <section className="admin-section">
      <PageHeader 
        title="Products" 
        eyebrow="Inventory"
        actions={
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span className="text-muted">
              {filteredProducts.length} shown / {products.length} total
            </span>
            {!showForm && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button 
                  type="button" 
                  className="success-action" 
                  onClick={handleExportCsv} 
                  title="Download products as CSV"
                  style={{ backgroundColor: "#10b981", color: "white" }}
                >
                  <Download size={16} style={{ marginRight: 8 }} /> Export CSV
                </button>
                <button
                  type="button"
                  className="info-action"
                  onClick={handleImportClick}
                  disabled={importing}
                  title="Upload products from CSV"
                  style={{ backgroundColor: "#3b82f6", color: "white" }}
                >
                  <Upload size={16} style={{ marginRight: 8 }} /> {importing ? 'Importing...' : 'Import CSV'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="text/csv,application/vnd.ms-excel"
                  style={{ display: 'none' }}
                  onChange={handleImportChange}
                />
                {/* Hide add button when user lacks permission */}
                <PermissionButton permission="create_products" className="primary-action" onClick={onAdd}>
                  <Plus size={17} /> Add product
                </PermissionButton>
              </div>
            )}
          </div>
        }
      />

      {missingRelations && showForm && (
        <p className="helper-note">
          Create at least one category and one supplier before saving products.
        </p>
      )}

      {showForm ? (
        <div className="erp-card fade-in">
          <div className="erp-card-body">
            <ProductForm
              categories={categories}
              editingProduct={editingProduct}
              form={form}
              loading={loading}
              missingRelations={missingRelations}
              suppliers={suppliers}
              onCancelEdit={onCancelEdit}
              onChange={onChange}
              onSubmit={onSubmit}
              onCreateCategory={handleCreateCategory}
              onCreateSupplier={handleCreateSupplier}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="erp-card fade-in" style={{ marginBottom: "16px" }}>
            <div className="erp-card-body" style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <input
                  type="text"
                  value={referenceFilter}
                  onChange={(event) => setReferenceFilter(event.target.value)}
                  placeholder="Filter by reference"
                />
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(event) => setNameFilter(event.target.value)}
                  placeholder="Filter by name"
                />
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}>
                  <option value="all">All suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                  <option value="all">All stock statuses</option>
                  <option value="in-stock">In stock</option>
                  <option value="low-stock">Low stock</option>
                  <option value="out-of-stock">Out of stock</option>
                </select>
                <button type="button" className="secondary-action" onClick={clearFilters} disabled={!hasActiveFilters}>
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          <DataTable headers={tableHeaders} loading={loading}>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                  <div className="empty-state">
                    <Package size={48} className="text-muted" style={{ marginBottom: "16px" }} />
                    <p>
                      {hasActiveFilters
                        ? "No products match the selected filters."
                        : "No products found in the catalog."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              [...paginatedData]
                .sort((a, b) => b.id - a.id)
                .map((product) => (
                  <tr key={product.id}>
                    <td><span className="text-mono">#{product.id}</span></td>

                    <td>
                      <div className="avatar-square">
                        <img
                          src={
                            product.image_path
                              ? `http://127.0.0.1:8000/storage/${product.image_path}`
                              : "/default.png"
                          }
                          alt={product.name}
                        />
                      </div>
                    </td>

                    <td><code className="ref-tag">{product.reference?.slice(0, 12)}</code></td>

                    <td>
                      <div className="product-cell">
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-desc">{product.description || "No description"}</span>
                        </div>
                      </div>
                    </td>

                    <td><Badge variant="info">{product.category?.name ?? "N/A"}</Badge></td>

                    <td><span className="text-dark font-medium">{product.supplier?.name ?? "N/A"}</span></td>

                    <td><span className="price-tag">{formatCurrency(product.price)}</span></td>

                    <td>
                      <div className="stock-cell">
                        <span className="stock-count">{product.stock ?? 0}</span>
                        {product.stock === 0 ? (
                          <Badge variant="danger" dot>Out of stock</Badge>
                        ) : (product.stock ?? 0) <= (product.min_stock + product.security_stock) ? (
                          <Badge variant="warning" dot>Low stock</Badge>
                        ) : (
                          <Badge variant="success" dot>In stock</Badge>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="row-actions">
                        <Can permission="edit_products">
                          <button
                            aria-label={`Edit ${product.name}`}
                            className="icon-btn"
                            disabled={loading}
                            onClick={() => onEdit(product)}
                            type="button"
                          >
                            <Edit3 size={16} />
                          </button>
                        </Can>

                        <Can permission="delete_products">
                          <button
                            aria-label={`Delete ${product.name}`}
                            className="icon-btn danger"
                            disabled={loading}
                            onClick={() => onDelete(product)}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </DataTable>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={prevPage}
            onNext={nextPage}
            onPageChange={goToPage}
          />
        </>
      )}
    </section>
  );
}
