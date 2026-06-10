import { X, Package, Tag, Building2, Boxes } from "lucide-react";
import { Badge } from "../common/Badge";
import { formatCurrency } from "../../utils/currency";
import { Product } from "../../types";
import defaultImage from "../../assets/product-defult.webp"

type Props = {
  product: Product | null;
  onClose: () => void;
};

export function ProductDetailsModal({ product, onClose }: Props) {
  if (!product) return null;

  const stock = Number(product.stock ?? 0);
  const minStock = Number(product.min_stock ?? 0);

  const stockStatus =
    stock === 0 ? "out" : stock <= minStock ? "low" : "good";

  

  const imageSrc =
    product.image_path && product.image_path.trim() !== null
      ? `http://127.0.0.1:8000/storage/${product.image_path}`
      : defaultImage;

  return (
    <div className="product-modal-overlay">
      <div className="product-modal">
        <button className="product-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="product-modal-header">
          <img
            src={imageSrc}
            alt={product.name}
      
          />

          <div>
            <h2>{product.name}</h2>
            <p>{product.reference}</p>

            <div className="modal-badges">
              <Badge variant="info">
                {product.category?.name ?? "N/A"}
              </Badge>

              {stockStatus === "good" && (
                <Badge variant="success">In Stock</Badge>
              )}

              {stockStatus === "low" && (
                <Badge variant="warning">Low Stock</Badge>
              )}

              {stockStatus === "out" && (
                <Badge variant="danger">Out Of Stock</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="product-stats-grid">
          <div className="stat-card">
            <Tag size={18} />
            <span>Price</span>
            <strong>{formatCurrency(product.price)}</strong>
          </div>

          <div className="stat-card">
            <Boxes size={18} />
            <span>Stock</span>
            <strong>{stock}</strong>
          </div>

          <div className="stat-card">
            <Package size={18} />
            <span>Min Stock</span>
            <strong>{product.min_stock}</strong>
          </div>

          <div className="stat-card">
            <Building2 size={18} />
            <span>Supplier</span>
            <strong>{product.supplier?.name ?? "N/A"}</strong>
          </div>
        </div>

        <div className="product-description">
          <h4>Description</h4>
          <p>{product.description || "No description available"}</p>
        </div>

        <div className="stock-progress">
          <div
            className="stock-progress-fill"
            style={{
              width: `${Math.min(
                (stock / Math.max(stock, minStock, 1)) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}