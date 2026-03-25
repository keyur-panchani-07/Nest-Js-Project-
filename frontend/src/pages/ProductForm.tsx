import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import type { Category, Product } from '../types';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (e) {
        console.error('Failed to load categories');
      }
    };

    const fetchProduct = async () => {
      if (!isEdit) return;
      try {
        const response = await api.get(`/products/${id}`);
        const product: Product = response.data;
        setValue('name', product.name);
        setValue('description', product.description);
        setValue('price', product.price);
        setValue('category_id', product.category_id);
        if (product.image) {
          setPreviewUrl(`http://localhost:3000${product.image}`);
        }
      } catch (e) {
        alert('Product not found');
        navigate('/products');
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id, isEdit, setValue, navigate]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category_id: data.category_id,
      };

      let productId = id;

      if (isEdit) {
        await api.patch(`/products/${id}`, payload);
      } else {
        const res = await api.post('/products', payload);
        productId = res.data.id;
      }

      // Handle Image Upload Separately
      if (imageFile && productId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await api.post(`/products/${productId}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate('/products');
    } catch (e) {
      console.error(e);
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              {...register('price', { required: 'Price is required', min: 0 })}
            />
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              {...register('category_id', { required: 'Category is required' })}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id.message as string}</p>}
          </div>
        </div>

        {/* Image Upload Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Image</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="h-32 w-32 object-cover border-2 border-dashed border-gray-300 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
