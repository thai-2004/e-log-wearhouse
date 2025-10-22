import React, { useState, useEffect } from 'react'
import { 
  FiSave, 
  FiX, 
  FiPlus, 
  FiTrash2, 
  FiSearch, 
  FiPackage, 
  FiTruck, 
  FiUser, 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiFileText, 
  FiUpload, 
  FiDownload,
  FiAlertCircle,
  FiCheckCircle,
  FiEdit,
  FiCopy
} from 'react-icons/fi'
import { useCreateOutbound, useUpdateOutbound, useOutboundItems, useAddOutboundItem, useUpdateOutboundItem, useRemoveOutboundItem, useUploadOutboundAttachment, useDeleteOutboundAttachment, useCalculateOutboundTotal, useCheckInventoryBeforeOutbound } from '../hooks/useOutbound'
import { useProducts } from '@features/Products/hooks/useProducts'
import { useCustomers } from '@features/Customers/hooks/useCustomers'
import { useWarehouses } from '@features/Warehouses/hooks/useWarehouses'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Select from '@components/ui/Select'
import Textarea from '@components/ui/Textarea'
import Modal from '@components/ui/Modal'
import toast from 'react-hot-toast'

const OutboundForm = ({ outbound, onClose, onSuccess }) => {
  // State management
  const [formData, setFormData] = useState({
    outboundNumber: '',
    type: 'normal',
    customerId: '',
    warehouseId: '',
    expectedDate: '',
    shippingMethod: 'standard',
    shippingAddress: '',
    notes: '',
    items: [],
    attachments: []
  })

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  })

  const [showProductModal, setShowProductModal] = useState(false)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // API hooks
  const createOutboundMutation = useCreateOutbound()
  const updateOutboundMutation = useUpdateOutbound()
  const { data: productsData } = useProducts({ limit: 1000 })
  const { data: customersData } = useCustomers({ limit: 1000 })
  const { data: warehousesData } = useWarehouses({ limit: 1000 })
  const { data: outboundItemsData } = useOutboundItems(outbound?.id)
  const addOutboundItemMutation = useAddOutboundItem()
  const updateOutboundItemMutation = useUpdateOutboundItem()
  const removeOutboundItemMutation = useRemoveOutboundItem()
  const uploadAttachmentMutation = useUploadOutboundAttachment()
  const deleteAttachmentMutation = useDeleteOutboundAttachment()
  const calculateTotalMutation = useCalculateOutboundTotal()
  const checkInventoryMutation = useCheckInventoryBeforeOutbound()

  // Computed values
  const products = productsData?.data || []
  const customers = customersData?.data || []
  const warehouses = warehousesData?.data || []
  const outboundItems = outboundItemsData || []

  // Initialize form data
  useEffect(() => {
    if (outbound) {
      setFormData({
        outboundNumber: outbound.outboundNumber || '',
        type: outbound.type || 'normal',
        customerId: outbound.customerId || '',
        warehouseId: outbound.warehouseId || '',
        expectedDate: outbound.expectedDate ? new Date(outbound.expectedDate).toISOString().split('T')[0] : '',
        shippingMethod: outbound.shippingMethod || 'standard',
        shippingAddress: outbound.shippingAddress || '',
        notes: outbound.notes || '',
        items: outboundItems,
        attachments: outbound.attachments || []
      })
    } else {
      // Generate new outbound number
      const newOutboundNumber = `OUT-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      setFormData(prev => ({
        ...prev,
        outboundNumber: newOutboundNumber
      }))
    }
  }, [outbound, outboundItems])

  // Event handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const handleItemChange = (field, value) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-fill unit price when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value)
      if (product) {
        setCurrentItem(prev => ({
          ...prev,
          unitPrice: product.price || 0
        }))
      }
    }
  }

  const handleAddItem = () => {
    if (!currentItem.productId || !currentItem.quantity) {
      toast.error('Vui lòng chọn sản phẩm và nhập số lượng')
      return
    }

    const product = products.find(p => p.id === currentItem.productId)
    if (!product) {
      toast.error('Sản phẩm không tồn tại')
      return
    }

    const newItem = {
      productId: currentItem.productId,
      product: product,
      quantity: parseInt(currentItem.quantity),
      unitPrice: parseFloat(currentItem.unitPrice),
      totalPrice: parseInt(currentItem.quantity) * parseFloat(currentItem.unitPrice),
      notes: currentItem.notes
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    setCurrentItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      notes: ''
    })
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Simulate upload (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }))

      toast.success('Upload tài liệu thành công!')
    } catch (error) {
      toast.error('Upload tài liệu thất bại')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleRemoveAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }))
  }

  const handleCalculateTotal = async () => {
    if (formData.items.length === 0) return

    try {
      const result = await calculateTotalMutation.mutateAsync(formData.items)
      toast.success('Tính toán tổng giá trị thành công!')
    } catch (error) {
      toast.error('Tính toán tổng giá trị thất bại')
    }
  }

  const handleCheckInventory = async () => {
    if (formData.items.length === 0) return

    try {
      const result = await checkInventoryMutation.mutateAsync(formData.items)
      if (result.hasInsufficientStock) {
        toast.error('Một số sản phẩm không đủ tồn kho!')
      } else {
        toast.success('Tất cả sản phẩm đều đủ tồn kho!')
      }
    } catch (error) {
      toast.error('Kiểm tra tồn kho thất bại')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.outboundNumber) {
      newErrors.outboundNumber = 'Số phiếu xuất kho là bắt buộc'
    }

    if (!formData.customerId) {
      newErrors.customerId = 'Khách hàng là bắt buộc'
    }

    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Kho xuất là bắt buộc'
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Phải có ít nhất một sản phẩm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        totalItems: formData.items.length,
        totalQuantity: formData.items.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
      }

      if (outbound) {
        await updateOutboundMutation.mutateAsync({ id: outbound.id, data: submitData })
      } else {
        await createOutboundMutation.mutateAsync(submitData)
      }

      onSuccess()
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.name} (${product.sku}) - ${new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(product.price)}`
  }))

  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: customer.name
  }))

  const warehouseOptions = warehouses.map(warehouse => ({
    value: warehouse.id,
    label: warehouse.name
  }))

  const shippingMethodOptions = [
    { value: 'standard', label: 'Giao hàng tiêu chuẩn' },
    { value: 'express', label: 'Giao hàng nhanh' },
    { value: 'overnight', label: 'Giao hàng trong ngày' },
    { value: 'pickup', label: 'Khách hàng tự lấy' }
  ]

  const outboundTypeOptions = [
    { value: 'normal', label: 'Xuất kho thường' },
    { value: 'return', label: 'Trả hàng' },
    { value: 'transfer', label: 'Chuyển kho' },
    { value: 'sample', label: 'Mẫu hàng' },
    { value: 'damaged', label: 'Hàng hỏng' }
  ]

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phiếu xuất kho *
              </label>
              <Input
                value={formData.outboundNumber}
                onChange={(e) => handleInputChange('outboundNumber', e.target.value)}
                error={errors.outboundNumber}
                disabled={!!outbound}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại phiếu xuất
              </label>
              <Select
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
                options={outboundTypeOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khách hàng *
              </label>
              <Select
                value={formData.customerId}
                onChange={(value) => handleInputChange('customerId', value)}
                options={customerOptions}
                error={errors.customerId}
                placeholder="Chọn khách hàng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kho xuất *
              </label>
              <Select
                value={formData.warehouseId}
                onChange={(value) => handleInputChange('warehouseId', value)}
                options={warehouseOptions}
                error={errors.warehouseId}
                placeholder="Chọn kho xuất"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày dự kiến xuất
              </label>
              <Input
                type="date"
                value={formData.expectedDate}
                onChange={(e) => handleInputChange('expectedDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức vận chuyển
              </label>
              <Select
                value={formData.shippingMethod}
                onChange={(value) => handleInputChange('shippingMethod', value)}
                options={shippingMethodOptions}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ giao hàng
            </label>
            <Textarea
              value={formData.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              rows={3}
              placeholder="Nhập địa chỉ giao hàng..."
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sản phẩm xuất kho</h3>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCalculateTotal}
                disabled={formData.items.length === 0}
              >
                <FiDollarSign className="h-4 w-4 mr-2" />
                Tính tổng
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckInventory}
                disabled={formData.items.length === 0}
              >
                <FiAlertCircle className="h-4 w-4 mr-2" />
                Kiểm tra tồn kho
              </Button>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sản phẩm
                </label>
                <Select
                  value={currentItem.productId}
                  onChange={(value) => handleItemChange('productId', value)}
                  options={productOptions}
                  placeholder="Chọn sản phẩm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng
                </label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => handleItemChange('quantity', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn giá
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.unitPrice}
                  onChange={(e) => handleItemChange('unitPrice', e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!currentItem.productId || !currentItem.quantity}
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Thêm
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú sản phẩm
              </label>
              <Input
                value={currentItem.notes}
                onChange={(e) => handleItemChange('notes', e.target.value)}
                placeholder="Ghi chú cho sản phẩm này..."
              />
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 ? (
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded object-cover"
                        src={item.product?.image || '/images/default-product.png'}
                        alt={item.product?.name}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {item.product?.sku}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">x</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm font-medium text-gray-900 w-20 text-right">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có sản phẩm nào</p>
            </div>
          )}

          {/* Total Summary */}
          {formData.items.length > 0 && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">
                    Tổng sản phẩm: {formData.items.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tổng số lượng: {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(formData.items.reduce((sum, item) => sum + item.totalPrice, 0))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tài liệu đính kèm</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAttachmentModal(true)}
            >
              <FiUpload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          {formData.attachments.length > 0 ? (
            <div className="space-y-2">
              {formData.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FiFileText className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {attachment.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <FiDownload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có tài liệu đính kèm</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ghi chú</h3>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="Nhập ghi chú cho phiếu xuất kho..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <FiX className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            <FiSave className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Đang lưu...' : 'Lưu phiếu xuất'}
          </Button>
        </div>
      </form>

      {/* Attachment Upload Modal */}
      <Modal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        title="Upload tài liệu"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploadingFile}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
          {uploadingFile && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang upload...</p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAttachmentModal(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OutboundForm
