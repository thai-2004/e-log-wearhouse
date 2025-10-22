import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productAPI } from '../api/productService'
import toast from 'react-hot-toast'

// Hook để lấy danh sách sản phẩm
export const useProducts = (params = {}) => {
  return useQuery(
    ['products', params],
    () => productAPI.getProducts(params),
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      cacheTime: 10 * 60 * 1000, // 10 phút
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm theo ID
export const useProduct = (id) => {
  return useQuery(
    ['product', id],
    () => productAPI.getProduct(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để tạo sản phẩm mới
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(productAPI.createProduct, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products'])
      toast.success('Tạo sản phẩm thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo sản phẩm thất bại')
    },
  })
}

// Hook để cập nhật sản phẩm
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, data }) => productAPI.updateProduct(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['products'])
        queryClient.invalidateQueries(['product', variables.id])
        toast.success('Cập nhật sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại')
      },
    }
  )
}

// Hook để xóa sản phẩm
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(productAPI.deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Xóa sản phẩm thành công!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại')
    },
  })
}

// Hook để tìm kiếm sản phẩm
export const useSearchProducts = (query) => {
  return useQuery(
    ['products', 'search', query],
    () => productAPI.searchProducts(query),
    {
      enabled: !!query && query.length > 2,
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 1,
    }
  )
}

// Hook để lấy sản phẩm theo danh mục
export const useProductsByCategory = (categoryId) => {
  return useQuery(
    ['products', 'category', categoryId],
    () => productAPI.getProductsByCategory(categoryId),
    {
      enabled: !!categoryId,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm theo SKU
export const useProductBySKU = (sku) => {
  return useQuery(
    ['product', 'sku', sku],
    () => productAPI.getProductBySKU(sku),
    {
      enabled: !!sku,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm theo barcode
export const useProductByBarcode = (barcode) => {
  return useQuery(
    ['product', 'barcode', barcode],
    () => productAPI.getProductByBarcode(barcode),
    {
      enabled: !!barcode,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )
}

// Hook để lấy sản phẩm sắp hết hàng
export const useLowStockProducts = () => {
  return useQuery(
    ['products', 'low-stock'],
    productAPI.getLowStockProducts,
    {
      staleTime: 2 * 60 * 1000, // 2 phút
      retry: 2,
    }
  )
}

// Hook để cập nhật giá sản phẩm
export const useUpdateProductPrice = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, priceData }) => productAPI.updateProductPrice(id, priceData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['products'])
        queryClient.invalidateQueries(['product', variables.id])
        toast.success('Cập nhật giá sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Cập nhật giá sản phẩm thất bại')
      },
    }
  )
}

// Hook để upload hình ảnh sản phẩm
export const useUploadProductImage = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, formData }) => productAPI.uploadProductImage(id, formData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['product', variables.id])
        toast.success('Upload hình ảnh thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Upload hình ảnh thất bại')
      },
    }
  )
}

// Hook để xóa hình ảnh sản phẩm
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ id, imageId }) => productAPI.deleteProductImage(id, imageId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['product', variables.id])
        toast.success('Xóa hình ảnh thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xóa hình ảnh thất bại')
      },
    }
  )
}

// Hook để xuất danh sách sản phẩm
export const useExportProducts = () => {
  return useMutation(
    (params) => productAPI.exportProducts(params),
    {
      onSuccess: (data) => {
        // Tạo blob và download file
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Xuất danh sách sản phẩm thành công!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Xuất danh sách sản phẩm thất bại')
      },
    }
  )
}

// Hook để import sản phẩm từ file
export const useImportProducts = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (formData) => productAPI.importProducts(formData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['products'])
        toast.success(`Import thành công ${data.imported} sản phẩm!`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Import sản phẩm thất bại')
      },
    }
  )
}
