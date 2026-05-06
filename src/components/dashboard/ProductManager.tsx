import { FormEvent } from "react";
import { Edit3, Package, Plus, Trash2 } from "lucide-react";
import type {
  Category,
  Product,
  ProductFormValues,
  Supplier,
} from "../../types";
import { ProductForm } from "./forms/ProductForm";

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
};

function money(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}
function lowStock(product: Product) {
  let hasLowStock = false;
  if (product.stock <= product.min_stock) {
    hasLowStock = true;
  }

  return hasLowStock;
}

function outOfStock(product: Product) {
  return product.stock === 0;
}
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
}: ProductManagerProps) {
  const missingRelations = categories.length === 0 || suppliers.length === 0;
  const showForm = isAdding || editingProduct !== null;
  
  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Products</h2>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span>{products.length} total</span>
          {!showForm && (
            <button className="primary-action" onClick={onAdd} type="button">
              <Plus size={17} /> Add product
            </button>
          )}
        </div>
      </div>

      {missingRelations && showForm && (
        <p className="helper-note">
          Create at least one category and one supplier before saving products.
        </p>
      )}

      {showForm ? (
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
        />
      ) : (
        <div className="table-wrap fade-in">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>reference</th>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Stock</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                [...products]
                  .sort((a, b) => b.id - a.id)
                  .map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>

                      <td>
                        <img
                          src={
                            product.image_path
                              ? `http://127.0.0.1:8000/storage/${product.image_path}`
                              : "/default.png"
                          }
                          alt={product.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                      </td>

                      <td>{product.reference?.slice(0, 12)}</td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <Package
                            size={18}
                            className="text-muted"
                            aria-hidden="true"
                          />

                          <div>
                            <strong>{product.name}</strong>
                            <span>
                              {product.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{product.category?.name ?? product.category_id}</td>

                      <td>{product.supplier?.name ?? product.supplier_id}</td>

                      <td>{money(product.price)} DH</td>

                     
                      <td style={{ position: "relative" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          {product.stock ?? 0} / min {product.min_stock ?? 0}
                          {lowStock(product) && (
                            <span className="low-stock-badge">LOW STOCK</span>
                          )}
                          {outOfStock(product) && (
                              <span className="out-stock-badge">OUT STOCK</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            aria-label={`Edit ${product.name}`}
                            disabled={loading}
                            onClick={() => onEdit(product)}
                            type="button"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            aria-label={`Delete ${product.name}`}
                            className="danger-action"
                            disabled={loading}
                            onClick={() => onDelete(product)}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
