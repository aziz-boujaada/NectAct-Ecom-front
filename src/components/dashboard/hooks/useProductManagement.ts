import { FormEvent, useState } from 'react';
import { createProduct, deleteProduct, updateProduct } from '../../../api/catalog';
import type { Product, Status } from '../../../types';
import { emptyProductForm, formFromProduct } from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type ProductManagementOptions = {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
};

export function useProductManagement({ setProducts, setLoading, setStatus }: ProductManagementOptions) {
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingProduct) {
        const product = await updateProduct(editingProduct.id, productForm);
        if (product) {
          setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
        }
        setStatus({ type: 'success', text: 'Product updated successfully' });
      } else {
        const product = await createProduct(productForm);
        if (product) {
          setProducts((current) => [product, ...current]);
        }
        setStatus({ type: 'success', text: 'Product created successfully' });
      }

      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setIsAddingProduct(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
        setProductForm(emptyProductForm);
      }
      setStatus({ type: 'success', text: 'Product deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return {
    productForm,
    editingProduct,
    isAddingProduct,
    setProductForm,
    handleProductSubmit,
    handleDeleteProduct,
    startAddingProduct: () => setIsAddingProduct(true),
    cancelProductEdit: () => {
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setIsAddingProduct(false);
    },
    editProduct: (product: Product) => {
      setEditingProduct(product);
      setProductForm(formFromProduct(product));
    },
  };
}
