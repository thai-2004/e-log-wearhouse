import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateProduct, useUpdateProduct, useUploadProductImage } from '../hooks/useProducts'
import { useCategories } from '../../Categories/hooks/useCategories'
import { useSuppliers } from '../../Suppliers/hooks/useSuppliers'

const ProductForm = ({ product, onClose }) => {
  const [images, setImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()
  const uploadImageMutation = useUploadProductImage()
  const { data: categoriesData, isLoading: loadingCategories } = useCategories({ limit: 1000 })
  const { data: suppliersData, isLoading: loadingSuppliers } = useSuppliers({ limit: 1000 })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError
  } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      price: '',
      cost: '',
      categoryId: '',
      supplierId: '',
      unit: '',
      minStock: '',
      maxStock: '',
      status: 'active',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      tags: '',
      isActive: true
    }
  })

  // Load product data khi edit
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        price: product.price || '',
        cost: product.cost || '',
        categoryId: product.categoryId || '',
        supplierId: (product.supplierId && (product.supplierId._id || product.supplierId)) || '',
        unit: product.unit || '',
        minStock: product.minStock || '',
        maxStock: product.maxStock || '',
        status: product.status || 'active',
        weight: product.weight || '',
        dimensions: {
          length: product.dimensions?.length || '',
          width: product.dimensions?.width || '',
          height: product.dimensions?.height || ''
        },
        tags: product.tags?.join(', ') || '',
        isActive: product.isActive !== false
      })
      setImages(product.images || [])
    }
  }, [product, reset])

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      // Không gửi dimensions để tránh xung đột validator (object) vs schema (string)
      const payload = {
        sku: data.sku,
        barcode: data.barcode || undefined,
        name: data.name,
        description: data.description || undefined,
        categoryId: data.categoryId,
        supplierId: data.supplierId || undefined,
        unit: data.unit, // bắt buộc theo schema backend
        weight: data.weight ? parseFloat(data.weight) : 0,
        // Gửi cả 2 cặp trường để tương thích validator và schema
        price: data.price ? parseFloat(data.price) : 0, // cho validator
        cost: data.cost ? parseFloat(data.cost) : 0,    // cho validator
        sellingPrice: data.price ? parseFloat(data.price) : 0, // cho schema
        costPrice: data.cost ? parseFloat(data.cost) : 0,      // cho schema
        minStock: data.minStock ? parseInt(data.minStock) : 0,
        maxStock: data.maxStock ? parseInt(data.maxStock) : 0,
        isActive: data.isActive !== false,
      }

      if (product) {
        await updateProductMutation.mutateAsync({
          id: product.id || product._id,
          data: payload
        })
      } else {
        await createProductMutation.mutateAsync(payload)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
      const resp = error.response?.data
      if (resp?.errors && Array.isArray(resp.errors)) {
        resp.errors.forEach((err) => {
          const field = err.field || err.param
          const message = err.message || err.msg || resp.message || 'Dữ liệu không hợp lệ'
          if (field) {
            // Map các field backend về form field nếu cần
            const fieldMap = {
              sellingPrice: 'price',
              costPrice: 'cost',
            }
            const formField = fieldMap[field] || field
            try {
              // setError được provide bởi react-hook-form
              // eslint-disable-next-line no-undef
              setError(formField, { type: 'server', message })
            } catch {}
          }
        })
      }
      console.error('Response:', resp)
    }
  }

  // Xử lý upload hình ảnh
  const handleImageUpload = async (files) => {
    setUploadingImages(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        
        if (product) {
          const result = await uploadImageMutation.mutateAsync({
            id: product.id || product._id,
            formData
          })
          return result.image
        } else {
          // Tạo preview URL cho hình ảnh mới
          return {
            url: URL.createObjectURL(file),
            file: file,
            isNew: true
          }
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedImages])
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  // Xóa hình ảnh
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const isLoading = createProductMutation.isLoading || updateProductMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Tên sản phẩm *"
            placeholder="Nhập tên sản phẩm"
            error={errors.name?.message}
            {...register('name', {
              required: 'Tên sản phẩm là bắt buộc',
              minLength: {
                value: 2,
                message: 'Tên sản phẩm phải có ít nhất 2 ký tự'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="SKU *"
            placeholder="Nhập mã SKU"
            error={errors.sku?.message}
            {...register('sku', {
              required: 'SKU là bắt buộc',
              pattern: {
                value: /^[A-Z0-9-]+$/,
                message: 'SKU chỉ được chứa CHỮ HOA, số và dấu gạch ngang (-)'
              }
            })}
            onChange={(e) => {
              // Auto normalize to backend rules: uppercase, remove invalid chars, replace '_' with '-'
              const raw = e.target.value || ''
              const normalized = raw.toUpperCase().replace(/_/g, '-').replace(/[^A-Z0-9-]/g, '')
              e.target.value = normalized
            }}
          />
        </div>

        <div>
          <Input
            label="Barcode"
            placeholder="Nhập mã vạch"
            error={errors.barcode?.message}
            {...register('barcode', {
              pattern: {
                value: /^[0-9]*$/,
                message: 'Barcode chỉ được chứa số'
              }
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            {...register('categoryId', {
              required: 'Danh mục là bắt buộc'
            })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={loadingCategories}
          >
            <option value="">Chọn danh mục</option>
            {categoriesData?.data?.categories?.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhà cung cấp
          </label>
          <select
            {...register('supplierId')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            disabled={loadingSuppliers}
          >
            <option value="">Chọn nhà cung cấp</option>
            {suppliersData?.data?.suppliers?.map((sup) => (
              <option key={sup._id || sup.id} value={sup._id || sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn vị tính *
          </label>
          <Input
            placeholder="Ví dụ: cái, hộp, kg"
            error={errors.unit?.message}
            {...register('unit', {
              required: 'Đơn vị tính là bắt buộc',
              minLength: {
                value: 1,
                message: 'Đơn vị tính không được để trống'
              }
            })}
          />
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả sản phẩm
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          rows={4}
          placeholder="Nhập mô tả sản phẩm"
          {...register('description')}
        />
      </div>

      {/* Giá và chi phí */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Giá bán *"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
            {...register('price', {
              required: 'Giá bán là bắt buộc',
              min: {
                value: 0,
                message: 'Giá bán phải lớn hơn 0'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Giá nhập"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.cost?.message}
            {...register('cost', {
              min: {
                value: 0,
                message: 'Giá nhập phải lớn hơn 0'
              }
            })}
          />
        </div>
      </div>

      {/* Tồn kho */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Tồn kho tối thiểu *"
            type="number"
            placeholder="0"
            error={errors.minStock?.message}
            {...register('minStock', {
              required: 'Tồn kho tối thiểu là bắt buộc',
              min: {
                value: 0,
                message: 'Tồn kho tối thiểu phải lớn hơn hoặc bằng 0'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Tồn kho tối đa"
            type="number"
            placeholder="0"
            error={errors.maxStock?.message}
            {...register('maxStock', {
              min: {
                value: 0,
                message: 'Tồn kho tối đa phải lớn hơn hoặc bằng 0'
              }
            })}
          />
        </div>
      </div>

      {/* Kích thước và trọng lượng */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Trọng lượng (kg)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.weight?.message}
            {...register('weight')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kích thước (cm)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Dài"
              type="number"
              step="0.01"
              {...register('dimensions.length')}
            />
            <Input
              placeholder="Rộng"
              type="number"
              step="0.01"
              {...register('dimensions.width')}
            />
            <Input
              placeholder="Cao"
              type="number"
              step="0.01"
              {...register('dimensions.height')}
            />
          </div>
        </div>
      </div>

      {/* Hình ảnh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh sản phẩm
        </label>
        
        {/* Upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {uploadingImages ? 'Đang upload...' : 'Click để upload hình ảnh'}
            </span>
          </label>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url || image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <Input
          label="Tags"
          placeholder="Nhập tags cách nhau bởi dấu phẩy"
          helperText="Ví dụ: điện tử, công nghệ, tiết kiệm"
          {...register('tags')}
        />
      </div>

      {/* Trạng thái */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          {...register('isActive')}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Sản phẩm đang hoạt động
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {product ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
