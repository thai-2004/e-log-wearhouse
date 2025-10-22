import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateCategory, useUpdateCategory, useUploadCategoryImage, useCategories } from '../hooks/useCategories'

const CategoryForm = ({ category, onClose }) => {
  const [image, setImage] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const uploadImageMutation = useUploadCategoryImage()
  const { data: categoriesData } = useCategories({ limit: 1000 })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
      isActive: true,
      sortOrder: 0,
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  })

  // Load category data khi edit
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || '',
        isActive: category.isActive !== false,
        sortOrder: category.sortOrder || 0,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        keywords: category.keywords || ''
      })
      setImage(category.image || null)
    }
  }, [category, reset])

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const categoryData = {
        ...data,
        sortOrder: parseInt(data.sortOrder),
        image: image
      }

      if (category?.id) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          data: categoryData
        })
      } else {
        await createCategoryMutation.mutateAsync(categoryData)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  // Xử lý upload hình ảnh
  const handleImageUpload = async (file) => {
    setUploadingImage(true)
    try {
      if (category?.id) {
        const formData = new FormData()
        formData.append('image', file)
        
        const result = await uploadImageMutation.mutateAsync({
          id: category.id,
          formData
        })
        setImage(result.image)
      } else {
        // Tạo preview URL cho hình ảnh mới
        const previewUrl = URL.createObjectURL(file)
        setImage(previewUrl)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  // Xóa hình ảnh
  const removeImage = () => {
    setImage(null)
  }

  const isLoading = createCategoryMutation.isLoading || updateCategoryMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="Tên danh mục *"
            placeholder="Nhập tên danh mục"
            error={errors.name?.message}
            {...register('name', {
              required: 'Tên danh mục là bắt buộc',
              minLength: {
                value: 2,
                message: 'Tên danh mục phải có ít nhất 2 ký tự'
              }
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục cha
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('parentId')}
          >
            <option value="">Danh mục gốc</option>
            {categoriesData?.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả danh mục
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          rows={4}
          placeholder="Nhập mô tả danh mục"
          {...register('description')}
        />
      </div>

      {/* Thứ tự sắp xếp */}
      <div>
        <Input
          label="Thứ tự sắp xếp"
          type="number"
          placeholder="0"
          error={errors.sortOrder?.message}
          {...register('sortOrder', {
            min: {
              value: 0,
              message: 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0'
            }
          })}
        />
      </div>

      {/* Hình ảnh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh danh mục
        </label>
        
        {/* Upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {uploadingImage ? 'Đang upload...' : 'Click để upload hình ảnh'}
            </span>
          </label>
        </div>

        {/* Image preview */}
        {image && (
          <div className="mt-4 relative inline-block">
            <img
              src={image}
              alt="Category preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <FiX className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* SEO Meta */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin SEO</h3>
        
        <div className="space-y-4">
          <div>
            <Input
              label="Meta Title"
              placeholder="Nhập meta title"
              {...register('metaTitle')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows={3}
              placeholder="Nhập meta description"
              {...register('metaDescription')}
            />
          </div>

          <div>
            <Input
              label="Keywords"
              placeholder="Nhập keywords cách nhau bởi dấu phẩy"
              helperText="Ví dụ: điện tử, công nghệ, tiết kiệm"
              {...register('keywords')}
            />
          </div>
        </div>
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
          Danh mục đang hoạt động
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
          {category?.id ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}

export default CategoryForm
