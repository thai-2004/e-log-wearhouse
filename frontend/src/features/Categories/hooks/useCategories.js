import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryAPI } from '../api/categoryService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách danh mục
export const useCategories = (params = {}) => {
  return useQuery(
    ['categories', params],
    () => categoryAPI.getCategories(params),
    {
      staleTime: 10 * 60 * 1000, // 10 phút
      cacheTime: 30 * 60 * 1000, // 30 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh mục theo ID
export const useCategory = (id) => {
  return useQuery(
    ['category', id],
    () => categoryAPI.getCategory(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo danh mục mới
export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation(categoryAPI.createCategory, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categoryTree'] })
      toast.success('Tạo danh mục thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo danh mục thất bại')
    },
  })
}

// Hook để cập nhật danh mục
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => categoryAPI.updateCategory(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['categories'])
        queryClient.invalidateQueries(['category', variables.id])
        queryClient.invalidateQueries(['categoryTree'])
        toast.success('Cập nhật danh mục thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật danh mục thất bại')
      },
    }
  )
}

// Hook để xóa danh mục
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation(categoryAPI.deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['categoryTree'])
      toast.success('Xóa danh mục thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa danh mục thất bại')
    },
  })
}

// Hook để lấy cây danh mục
export const useCategoryTree = () => {
  return useQuery(
    ['categoryTree'],
    categoryAPI.getCategoryTree,
    {
      staleTime: 15 * 60 * 1000, // 15 phút
      cacheTime: 30 * 60 * 1000, // 30 phút
      retry: 2,
    }
  )
}

// Hook để lấy danh mục con theo parent
export const useCategoriesByParent = (parentId) => {
  return useQuery(
    ['categories', 'parent', parentId],
    () => categoryAPI.getCategoriesByParent(parentId),
    {
      enabled: !!parentId,
      staleTime: 10 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để di chuyển danh mục
export const useMoveCategory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, newParentId }) => categoryAPI.moveCategory(id, newParentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['categories'])
        queryClient.invalidateQueries(['categoryTree'])
        toast.success('Di chuyển danh mục thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Di chuyển danh mục thất bại')
      },
    }
  )
}

// Hook để cập nhật hàng loạt
export const useBulkUpdateCategories = () => {
  const queryClient = useQueryClient()

  return useMutation(categoryAPI.bulkUpdateCategories, {
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      queryClient.invalidateQueries(['categoryTree'])
      toast.success('Cập nhật hàng loạt thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật hàng loạt thất bại')
    },
  })
}

// Hook để lấy thống kê danh mục
export const useCategoryStatistics = () => {
  return useQuery(
    ['categoryStatistics'],
    categoryAPI.getCategoryStatistics,
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      retry: 2,
    }
  )
}

// Hook để tìm kiếm danh mục
export const useSearchCategories = (query) => {
  return useQuery(
    ['categories', 'search', query],
    () => categoryAPI.searchCategories(query),
    {
      enabled: !!query && query.length > 2,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 1,
    }
  )
}

// Hook để xuất danh mục
export const useExportCategories = () => {
  return useMutation(
    (params) => categoryAPI.exportCategories(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `categories_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách danh mục thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách danh mục thất bại')
      },
    }
  )
}

// Hook để upload hình ảnh danh mục
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, formData }) => categoryAPI.uploadCategoryImage(id, formData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['category', variables.id])
        queryClient.invalidateQueries(['categories'])
        toast.success('Upload hình ảnh thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload hình ảnh thất bại')
      },
    }
  )
}

// Hook để xóa hình ảnh danh mục
export const useDeleteCategoryImage = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, imageId }) => categoryAPI.deleteCategoryImage(id, imageId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['category', variables.id])
        queryClient.invalidateQueries(['categories'])
        toast.success('Xóa hình ảnh thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa hình ảnh thất bại')
      },
    }
  )
}
