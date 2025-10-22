import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiX, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateCustomer, useUpdateCustomer, useUploadCustomerAvatar, useCustomerGroups, useAddCustomerAddress, useUpdateCustomerAddress, useDeleteCustomerAddress, useSetDefaultAddress } from '../hooks/useCustomers'

const CustomerForm = ({ customer, onClose }) => {
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  
  const createCustomerMutation = useCreateCustomer()
  const updateCustomerMutation = useUpdateCustomer()
  const uploadAvatarMutation = useUploadCustomerAvatar()
  const { data: groupsData } = useCustomerGroups()
  const addAddressMutation = useAddCustomerAddress()
  const updateAddressMutation = useUpdateCustomerAddress()
  const deleteAddressMutation = useDeleteCustomerAddress()
  const setDefaultAddressMutation = useSetDefaultAddress()

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
      email: '',
      phone: '',
      group: '',
      status: 'active',
      notes: '',
      isVip: false
    }
  })

  // Load customer data khi edit
  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        group: customer.group?.id || '',
        status: customer.status || 'active',
        notes: customer.notes || '',
        isVip: customer.isVip || false
      })
      setAvatarPreview(customer.avatar)
      setAddresses(customer.addresses || [])
    }
  }, [customer, reset])

  // Xử lý upload avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý xóa avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  // Xử lý thêm địa chỉ
  const handleAddAddress = async (addressData) => {
    if (customer?.id) {
      await addAddressMutation.mutateAsync({
        customerId: customer.id,
        data: addressData
      })
      // Refresh addresses
      setAddresses([...addresses, { ...addressData, id: Date.now() }])
    } else {
      setAddresses([...addresses, { ...addressData, id: Date.now() }])
    }
    setShowAddressForm(false)
  }

  // Xử lý cập nhật địa chỉ
  const handleUpdateAddress = async (addressId, addressData) => {
    if (customer?.id) {
      await updateAddressMutation.mutateAsync({
        customerId: customer.id,
        addressId,
        data: addressData
      })
      setAddresses(addresses.map(addr => 
        addr.id === addressId ? { ...addr, ...addressData } : addr
      ))
    } else {
      setAddresses(addresses.map(addr => 
        addr.id === addressId ? { ...addr, ...addressData } : addr
      ))
    }
    setEditingAddress(null)
  }

  // Xử lý xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    if (customer?.id) {
      await deleteAddressMutation.mutateAsync({
        customerId: customer.id,
        addressId
      })
    }
    setAddresses(addresses.filter(addr => addr.id !== addressId))
  }

  // Xử lý đặt địa chỉ mặc định
  const handleSetDefaultAddress = async (addressId) => {
    if (customer?.id) {
      await setDefaultAddressMutation.mutateAsync({
        customerId: customer.id,
        addressId
      })
    }
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })))
  }

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      let customerId = null

      if (customer?.id) {
        // Cập nhật khách hàng
        await updateCustomerMutation.mutateAsync({
          id: customer.id,
          data: { ...data, addresses }
        })
        customerId = customer.id
      } else {
        // Tạo khách hàng mới
        const newCustomer = await createCustomerMutation.mutateAsync({ ...data, addresses })
        customerId = newCustomer.id
      }

      // Upload avatar nếu có
      if (avatarFile && customerId) {
        await uploadAvatarMutation.mutateAsync({
          id: customerId,
          file: avatarFile
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const isLoading = createCustomerMutation.isLoading || 
                   updateCustomerMutation.isLoading || 
                   uploadAvatarMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <FiUser className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="avatar-upload"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <FiUpload className="h-4 w-4 mr-2" />
              Chọn ảnh
            </label>
            
            {avatarPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
                className="text-red-600 hover:text-red-700"
              >
                <FiX className="h-4 w-4 mr-1" />
                Xóa
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            JPG, PNG hoặc GIF. Tối đa 2MB.
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Họ và tên *"
            placeholder="Nhập họ và tên"
            error={errors.name?.message}
            {...register('name', {
              required: 'Họ và tên là bắt buộc',
              minLength: {
                value: 2,
                message: 'Họ và tên phải có ít nhất 2 ký tự'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Email *"
            type="email"
            placeholder="Nhập email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email là bắt buộc',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email không hợp lệ'
              }
            })}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[0-9+\-\s()]+$/,
                message: 'Số điện thoại không hợp lệ'
              }
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhóm khách hàng
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('group')}
          >
            <option value="">Chọn nhóm</option>
            {groupsData?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status and VIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="pending">Chờ xác nhận</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
          )}
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register('isVip')}
            />
            <span className="ml-2 text-sm text-gray-700">Khách hàng VIP</span>
          </label>
        </div>
      </div>

      {/* Addresses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Địa chỉ</h3>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAddressForm(true)}
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Thêm địa chỉ
          </Button>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <FiMapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {address.address}
                    </div>
                    <div className="text-sm text-gray-500">
                      {address.city}, {address.district}, {address.ward}
                    </div>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefaultAddress(address.id)}
                    >
                      Đặt mặc định
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingAddress(address)}
                  >
                    <FiEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có địa chỉ nào</p>
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
          placeholder="Nhập ghi chú bổ sung..."
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
          disabled={isLoading}
        >
          {customer?.id ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressForm
          address={editingAddress}
          onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
          onClose={() => {
            setShowAddressForm(false)
            setEditingAddress(null)
          }}
        />
      )}
    </form>
  )
}

// Address Form Component
const AddressForm = ({ address, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      address: address?.address || '',
      city: address?.city || '',
      district: address?.district || '',
      ward: address?.ward || '',
      postalCode: address?.postalCode || '',
      isDefault: address?.isDefault || false
    }
  })

  const onSubmit = (data) => {
    onSave(address?.id, data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Địa chỉ *"
              placeholder="Nhập địa chỉ chi tiết"
              error={errors.address?.message}
              {...register('address', {
                required: 'Địa chỉ là bắt buộc'
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Tỉnh/Thành phố *"
                placeholder="Nhập tỉnh/thành phố"
                error={errors.city?.message}
                {...register('city', {
                  required: 'Tỉnh/thành phố là bắt buộc'
                })}
              />
            </div>
            <div>
              <Input
                label="Quận/Huyện *"
                placeholder="Nhập quận/huyện"
                error={errors.district?.message}
                {...register('district', {
                  required: 'Quận/huyện là bắt buộc'
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Phường/Xã"
                placeholder="Nhập phường/xã"
                {...register('ward')}
              />
            </div>
            <div>
              <Input
                label="Mã bưu điện"
                placeholder="Nhập mã bưu điện"
                {...register('postalCode')}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('isDefault')}
              />
              <span className="ml-2 text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
            </label>
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
              {address ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerForm
