import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiTruck, FiMail, FiPhone, FiMapPin, FiUpload, FiX, FiPlus, FiTrash2, FiEdit, FiUser, FiStar } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useCreateSupplier, useUpdateSupplier, useUploadSupplierLogo, useAddSupplierAddress, useUpdateSupplierAddress, useDeleteSupplierAddress, useSetDefaultSupplierAddress, useAddSupplierContact, useUpdateSupplierContact, useDeleteSupplierContact } from '../hooks/useSuppliers'

const SupplierForm = ({ supplier, onClose }) => {
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [contacts, setContacts] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [editingContact, setEditingContact] = useState(null)
  
  const createSupplierMutation = useCreateSupplier()
  const updateSupplierMutation = useUpdateSupplier()
  const uploadLogoMutation = useUploadSupplierLogo()
  const addAddressMutation = useAddSupplierAddress()
  const updateAddressMutation = useUpdateSupplierAddress()
  const deleteAddressMutation = useDeleteSupplierAddress()
  const setDefaultAddressMutation = useSetDefaultSupplierAddress()
  const addContactMutation = useAddSupplierContact()
  const updateContactMutation = useUpdateSupplierContact()
  const deleteContactMutation = useDeleteSupplierContact()

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
      code: '',
      name: '',
      email: '',
      phone: '',
      category: '',
      status: 'active',
      website: '',
      taxCode: '',
      description: '',
      isTopSupplier: false
    }
  })

  // Load supplier data khi edit
  useEffect(() => {
    if (supplier) {
      reset({
        code: supplier.code || '',
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        category: supplier.category || '',
        status: supplier.status || 'active',
        website: supplier.website || '',
        taxCode: supplier.taxCode || '',
        description: supplier.description || '',
        isTopSupplier: supplier.isTopSupplier || false
      })
      setLogoPreview(supplier.logo)
      setAddresses(supplier.addresses || [])
      setContacts(supplier.contacts || [])
    } else {
      // Reset form về giá trị mặc định khi tạo mới
      reset({
        code: '',
        name: '',
        email: '',
        phone: '',
        category: '',
        status: 'active',
        website: '',
        taxCode: '',
        description: '',
        isTopSupplier: false
      })
      setLogoPreview(null)
      setAddresses([])
      setContacts([])
    }
  }, [supplier, reset])

  // Xử lý upload logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Xử lý xóa logo
  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  // Xử lý thêm địa chỉ
  const handleAddAddress = async (addressData) => {
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await addAddressMutation.mutateAsync({
        supplierId: supplierIdValue,
        data: addressData
      })
      setAddresses([...addresses, { ...addressData, id: Date.now() }])
    } else {
      setAddresses([...addresses, { ...addressData, id: Date.now() }])
    }
    setShowAddressForm(false)
  }

  // Xử lý cập nhật địa chỉ
  const handleUpdateAddress = async (addressId, addressData) => {
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await updateAddressMutation.mutateAsync({
        supplierId: supplierIdValue,
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
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await deleteAddressMutation.mutateAsync({
        supplierId: supplierIdValue,
        addressId
      })
    }
    setAddresses(addresses.filter(addr => addr.id !== addressId))
  }

  // Xử lý đặt địa chỉ mặc định
  const handleSetDefaultAddress = async (addressId) => {
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await setDefaultAddressMutation.mutateAsync({
        supplierId: supplierIdValue,
        addressId
      })
    }
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })))
  }

  // Xử lý thêm liên hệ
  const handleAddContact = async (contactData) => {
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await addContactMutation.mutateAsync({
        supplierId: supplierIdValue,
        data: contactData
      })
      setContacts([...contacts, { ...contactData, id: Date.now() }])
    } else {
      setContacts([...contacts, { ...contactData, id: Date.now() }])
    }
    setShowContactForm(false)
  }

  // Xử lý cập nhật liên hệ
  const handleUpdateContact = async (contactId, contactData) => {
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await updateContactMutation.mutateAsync({
        supplierId: supplierIdValue,
        contactId,
        data: contactData
      })
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, ...contactData } : contact
      ))
    } else {
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, ...contactData } : contact
      ))
    }
    setEditingContact(null)
  }

  // Xử lý xóa liên hệ
  const handleDeleteContact = async (contactId) => {
    const supplierIdValue = supplier?.id || supplier?._id
    if (supplierIdValue) {
      await deleteContactMutation.mutateAsync({
        supplierId: supplierIdValue,
        contactId
      })
    }
    setContacts(contacts.filter(contact => contact.id !== contactId))
  }

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const payload = {
        code: (data.code || '').toUpperCase().trim(),
        name: (data.name || '').trim(),
        email: data.email || undefined,
        phone: data.phone || undefined,
        category: data.category || undefined,
        status: data.status || 'active',
        website: data.website || undefined,
        taxCode: data.taxCode || undefined,
        description: data.description || undefined,
        isTopSupplier: !!data.isTopSupplier,
        addresses,
        contacts,
      }

      let supplierId = null

      // Kiểm tra cả id và _id để tương thích với cả hai format
      const supplierIdValue = supplier?.id || supplier?._id

      if (supplierIdValue) {
        await updateSupplierMutation.mutateAsync({ id: supplierIdValue, data: payload })
        supplierId = supplierIdValue
      } else {
        const result = await createSupplierMutation.mutateAsync(payload)
        supplierId = result.id || result._id
      }

      if (logoFile && supplierId) {
        await uploadLogoMutation.mutateAsync({ id: supplierId, file: logoFile })
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving supplier:', error)
      const resp = error.response?.data
      if (Array.isArray(resp?.errors)) {
        resp.errors.forEach((err) => {
          const field = err.field || err.param
          const message = err.message || resp.message || 'Dữ liệu không hợp lệ'
          if (field) {
            try {
              setValue(field, (watch(field) || '').toString())
              // eslint-disable-next-line no-undef
              setError(field, { type: 'server', message })
            } catch {}
          }
        })
      }
    }
  }

  const isLoading = createSupplierMutation.isLoading || 
                   updateSupplierMutation.isLoading || 
                   uploadLogoMutation.isLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <FiTruck className="h-8 w-8 text-gray-400" />
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
              id="logo-upload"
              onChange={handleLogoChange}
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <FiUpload className="h-4 w-4 mr-2" />
              Chọn logo
            </label>
            
            {logoPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
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
            label="Mã nhà cung cấp (CODE) *"
            placeholder="VD: SUP-001"
            error={errors.code?.message}
            {...register('code', {
              required: 'Mã nhà cung cấp là bắt buộc',
              pattern: { value: /^[A-Z0-9-]+$/, message: 'Chỉ CHỮ HOA, số, gạch ngang' },
              minLength: { value: 2, message: 'Tối thiểu 2 ký tự' }
            })}
            onChange={(e) => {
              const raw = e.target.value || ''
              e.target.value = raw.toUpperCase().replace(/_/g,'-').replace(/[^A-Z0-9-]/g,'')
            }}
          />
        </div>

        <div>
          <Input
            label="Tên công ty *"
            placeholder="Nhập tên công ty"
            error={errors.name?.message}
            {...register('name', {
              required: 'Tên công ty là bắt buộc',
              minLength: { value: 2, message: 'Tên công ty phải có ít nhất 2 ký tự' }
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
          <Input
            label="Website"
            placeholder="Nhập website"
            error={errors.website?.message}
            {...register('website', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Website phải bắt đầu bằng http:// hoặc https://'
              }
            })}
          />
        </div>
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('category')}
            value={watch('category') || ''}
          >
            <option value="">Chọn danh mục</option>
            <option value="electronics">Điện tử</option>
            <option value="clothing">Thời trang</option>
            <option value="food">Thực phẩm</option>
            <option value="books">Sách</option>
            <option value="furniture">Nội thất</option>
            <option value="automotive">Ô tô</option>
            <option value="beauty">Làm đẹp</option>
            <option value="sports">Thể thao</option>
          </select>
        </div>

        <div>
          <Input
            label="Mã số thuế"
            placeholder="Nhập mã số thuế"
            {...register('taxCode')}
          />
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
              {...register('isTopSupplier')}
            />
            <span className="ml-2 text-sm text-gray-700">Nhà cung cấp hàng đầu</span>
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

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Liên hệ</h3>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowContactForm(true)}
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Thêm liên hệ
          </Button>
        </div>

        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {contact.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contact.position} - {contact.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contact.phone}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingContact(contact)}
                  >
                    <FiEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có liên hệ nào</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          rows={3}
          placeholder="Nhập mô tả về nhà cung cấp..."
          {...register('description')}
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
          {(supplier?.id || supplier?._id) ? 'Cập nhật' : 'Tạo mới'}
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

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onSave={editingContact ? handleUpdateContact : handleAddContact}
          onClose={() => {
            setShowContactForm(false)
            setEditingContact(null)
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

// Contact Form Component
const ContactForm = ({ contact, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: contact?.name || '',
      position: contact?.position || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      department: contact?.department || ''
    }
  })

  const onSubmit = (data) => {
    onSave(contact?.id, data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {contact ? 'Chỉnh sửa liên hệ' : 'Thêm liên hệ mới'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Tên liên hệ *"
              placeholder="Nhập tên liên hệ"
              error={errors.name?.message}
              {...register('name', {
                required: 'Tên liên hệ là bắt buộc'
              })}
            />
          </div>

          <div>
            <Input
              label="Chức vụ *"
              placeholder="Nhập chức vụ"
              error={errors.position?.message}
              {...register('position', {
                required: 'Chức vụ là bắt buộc'
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

          <div>
            <Input
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              {...register('phone')}
            />
          </div>

          <div>
            <Input
              label="Phòng ban"
              placeholder="Nhập phòng ban"
              {...register('department')}
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
              {contact ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupplierForm
