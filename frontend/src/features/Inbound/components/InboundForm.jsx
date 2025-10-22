import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiTrash2, FiEdit, FiPackage, FiTruck, FiCalendar, FiDollarSign, FiFileText, FiUpload, FiX, FiSearch, FiAlertCircle } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateInbound, useUpdateInbound, useAddInboundItem, useUpdateInboundItem, useRemoveInboundItem, useCalculateInboundTotal, useCheckInventoryBeforeInbound, useUploadInboundAttachment } from '../hooks/useInbound'
import { useSuppliers } from '../../Suppliers/hooks/useSuppliers'
import { useWarehouses } from '../../Warehouses/hooks/useWarehouses'
import { useProducts } from '../../Products/hooks/useProducts'

const InboundForm = ({ inbound, onClose }) => {
  const [items, setItems] = useState([])
  const [attachments, setAttachments] = useState([])
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [totalValue, setTotalValue] = useState(0)
  
  const createInboundMutation = useCreateInbound()
  const updateInboundMutation = useUpdateInbound()
  const addItemMutation = useAddInboundItem()
  const updateItemMutation = useUpdateInboundItem()
  const removeItemMutation = useRemoveInboundItem()
  const calculateTotalMutation = useCalculateInboundTotal()
  const checkInventoryMutation = useCheckInventoryBeforeInbound()
  const uploadAttachmentMutation = useUploadInboundAttachment()

  // Load data
  const { data: suppliersData } = useSuppliers()
  const { data: warehousesData } = useWarehouses()
  const { data: productsData } = useProducts()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      inboundNumber: '',
      supplierId: '',
      warehouseId: '',
      expectedDate: '',
      notes: '',
      status: 'pending'
    }
  })

  // Load inbound data khi edit
  useEffect(() => {
    if (inbound) {
      reset({
        inboundNumber: inbound.inboundNumber || '',
        supplierId: inbound.supplierId || '',
        warehouseId: inbound.warehouseId || '',
        expectedDate: inbound.expectedDate || '',
        notes: inbound.notes || '',
        status: inbound.status || 'pending'
      })
      setItems(inbound.items || [])
      setAttachments(inbound.attachments || [])
      setTotalValue(inbound.totalValue || 0)
    } else {
      // Generate inbound number for new inbound
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setValue('inboundNumber', `NK${year}${month}${day}${random}`)
    }
  }, [inbound, reset, setValue])

  // Calculate total when items change
  useEffect(() => {
    if (items.length > 0) {
      calculateTotalMutation.mutate(items, {
        onSuccess: (data) => {
          setTotalValue(data.total)
        }
      })
    } else {
      setTotalValue(0)
    }
  }, [items, calculateTotalMutation])

  // Xử lý thêm sản phẩm
  const handleAddItem = async (productData) => {
    const newItem = {
      id: Date.now(),
      productId: productData.id,
      product: productData,
      quantity: 1,
      unitPrice: productData.price || 0,
      totalPrice: productData.price || 0,
      notes: ''
    }

    if (inbound?.id) {
      await addItemMutation.mutateAsync({
        inboundId: inbound.id,
        data: newItem
      })
    }
    
    setItems([...items, newItem])
    setShowProductSearch(false)
  }

  // Xử lý cập nhật sản phẩm
  const handleUpdateItem = async (itemId, itemData) => {
    if (inbound?.id) {
      await updateItemMutation.mutateAsync({
        inboundId: inbound.id,
        itemId,
        data: itemData
      })
    }
    
    setItems(items.map(item => 
      item.id === itemId ? { ...item, ...itemData } : item
    ))
    setEditingItem(null)
  }

  // Xử lý xóa sản phẩm
  const handleRemoveItem = async (itemId) => {
    if (inbound?.id) {
      await removeItemMutation.mutateAsync({
        inboundId: inbound.id,
        itemId
      })
    }
    
    setItems(items.filter(item => item.id !== itemId))
  }

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (itemId, quantity) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      const totalPrice = quantity * item.unitPrice
      handleUpdateItem(itemId, { quantity, totalPrice })
    }
  }

  // Xử lý thay đổi giá
  const handlePriceChange = (itemId, unitPrice) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      const totalPrice = item.quantity * unitPrice
      handleUpdateItem(itemId, { unitPrice, totalPrice })
    }
  }

  // Xử lý upload tài liệu
  const handleAttachmentUpload = async (file) => {
    if (inbound?.id) {
      await uploadAttachmentMutation.mutateAsync({
        inboundId: inbound.id,
        file
      })
    }
    
    const newAttachment = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }
    setAttachments([...attachments, newAttachment])
  }

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const inboundData = {
        ...data,
        items,
        attachments,
        totalValue
      }

      if (inbound?.id) {
        await updateInboundMutation.mutateAsync({
          id: inbound.id,
          data: inboundData
        })
      } else {
        await createInboundMutation.mutateAsync(inboundData)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving inbound:', error)
    }
  }

  const isLoading = createInboundMutation.isLoading || updateInboundMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Mã phiếu nhập *"
            placeholder="Nhập mã phiếu nhập"
            error={errors.inboundNumber?.message}
            {...register('inboundNumber', {
              required: 'Mã phiếu nhập là bắt buộc'
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái *
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('status', {
              required: 'Trạng thái là bắt buộc'
            })}
          >
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Supplier and Warehouse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhà cung cấp *
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('supplierId', {
              required: 'Nhà cung cấp là bắt buộc'
            })}
          >
            <option value="">Chọn nhà cung cấp</option>
            {suppliersData?.suppliers?.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="text-sm text-red-600 mt-1">{errors.supplierId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kho nhập *
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('warehouseId', {
              required: 'Kho nhập là bắt buộc'
            })}
          >
            <option value="">Chọn kho nhập</option>
            {warehousesData?.warehouses?.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          {errors.warehouseId && (
            <p className="text-sm text-red-600 mt-1">{errors.warehouseId.message}</p>
          )}
        </div>
      </div>

      {/* Expected Date */}
      <div>
        <Input
          label="Ngày dự kiến nhập"
          type="date"
          {...register('expectedDate')}
        />
      </div>

      {/* Items Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Sản phẩm</h3>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowProductSearch(true)}
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded object-cover"
                      src={item.product?.image || '/images/default-product.png'}
                      alt={item.product?.name}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.product?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {item.product?.sku}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <label className="block text-xs text-gray-500 mb-1">Số lượng</label>
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="text-sm">
                    <label className="block text-xs text-gray-500 mb-1">Đơn giá</label>
                    <input
                      type="number"
                      min="0"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      value={item.unitPrice}
                      onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900">
                    <label className="block text-xs text-gray-500 mb-1">Thành tiền</label>
                    <div>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(item.totalPrice)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                    >
                      <FiEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có sản phẩm nào</p>
          </div>
        )}
      </div>

      {/* Total Value */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Tổng giá trị:</span>
          <span className="text-2xl font-bold text-primary-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(totalValue)}
          </span>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Tài liệu đính kèm</h3>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="attachment-upload"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                handleAttachmentUpload(file)
              }
            }}
          />
          <label
            htmlFor="attachment-upload"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <FiUpload className="h-4 w-4 mr-2" />
            Upload
          </label>
        </div>

        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {attachment.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <FiX className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có tài liệu nào</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          rows={3}
          placeholder="Nhập ghi chú..."
          {...register('notes')}
        />
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
          disabled={isLoading || items.length === 0}
        >
          {inbound?.id ? 'Cập nhật' : 'Tạo phiếu nhập'}
        </Button>
      </div>

      {/* Product Search Modal */}
      {showProductSearch && (
        <ProductSearchModal
          products={productsData?.products || []}
          onSelect={handleAddItem}
          onClose={() => setShowProductSearch(false)}
        />
      )}

      {/* Item Edit Modal */}
      {editingItem && (
        <ItemEditModal
          item={editingItem}
          onSave={handleUpdateItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </form>
  )
}

// Product Search Modal Component
const ProductSearchModal = ({ products, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(products)

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Chọn sản phẩm</h3>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <FiX className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(product)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded object-cover"
                      src={product.image || '/images/default-product.png'}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {product.sku} | Giá: {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.price || 0)}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                >
                  Thêm
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Item Edit Modal Component
const ItemEditModal = ({ item, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: item.notes || ''
    }
  })

  const onSubmit = (data) => {
    onSave(item.id, data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Chỉnh sửa sản phẩm
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng *
            </label>
            <input
              type="number"
              min="1"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              {...register('quantity', {
                required: 'Số lượng là bắt buộc',
                min: {
                  value: 1,
                  message: 'Số lượng phải lớn hơn 0'
                }
              })}
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn giá *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              {...register('unitPrice', {
                required: 'Đơn giá là bắt buộc',
                min: {
                  value: 0,
                  message: 'Đơn giá phải lớn hơn hoặc bằng 0'
                }
              })}
            />
            {errors.unitPrice && (
              <p className="text-sm text-red-600 mt-1">{errors.unitPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows={3}
              placeholder="Nhập ghi chú..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
            >
              Cập nhật
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InboundForm
