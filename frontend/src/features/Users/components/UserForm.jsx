import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiUser, FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { ROLES } from '@config'
import { useCreateUser, useUpdateUser, useUploadAvatar } from '../hooks/useUsers'

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Quản trị viên' },
  { value: ROLES.MANAGER, label: 'Quản lý' },
  { value: ROLES.STAFF, label: 'Nhân viên' },
  { value: ROLES.VIEWER, label: 'Người xem' }
]

const STATUS_OPTIONS = [
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Không hoạt động' }
]

const UserForm = ({ user, onClose }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const uploadAvatarMutation = useUploadAvatar()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: ROLES.STAFF,
      isActive: 'true',
      notes: ''
    }
  })

  // Load user data khi edit
  useEffect(() => {
    if (user) {
      reset({
        username: user?.username || '',
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        phone: user?.phone || '',
        role: user?.role || ROLES.STAFF,
        isActive: user?.isActive !== undefined ? String(user.isActive) : 'true',
        notes: user?.notes || ''
      })
      setAvatarPreview(user?.avatar || user?.avatarUrl || null)
    } else {
      reset({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: ROLES.STAFF,
        isActive: 'true',
        notes: ''
      })
      setAvatarPreview(null)
    }
  }, [user, reset])

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

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      let userId = null

      const payload = {
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        isActive: data.isActive === 'true'
      }

      if (data.password) {
        payload.password = data.password
      }

      if (user?.id) {
        // Cập nhật người dùng
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: payload
        })
        userId = user.id
      } else {
        // Tạo người dùng mới
        const newUser = await createUserMutation.mutateAsync(payload)
        userId = newUser?.data?.user?._id || newUser?.data?.user?.id
      }

      // Upload avatar nếu có
      if (avatarFile && userId) {
        await uploadAvatarMutation.mutateAsync({
          id: userId,
          file: avatarFile
        })
      }

      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const isLoading = createUserMutation.isLoading ||
    updateUserMutation.isLoading ||
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
            label="Tên đăng nhập *"
            placeholder="Nhập tên đăng nhập"
            error={errors.username?.message}
            {...register('username', {
              required: 'Tên đăng nhập là bắt buộc',
              minLength: {
                value: 2,
                message: 'Tên đăng nhập phải có ít nhất 2 ký tự'
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Chỉ cho phép chữ, số và dấu gạch dưới'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Họ và tên *"
            placeholder="Nhập họ và tên"
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'Họ và tên là bắt buộc',
              minLength: {
                value: 2,
                message: 'Họ và tên phải có ít nhất 2 ký tự'
              }
            })}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[0-9+\-\s()]+$/,
                message: 'Số điện thoại không hợp lệ'
              }
            })}
          />
        </div>
      </div>

      {/* Password Fields */}
      {!user?.id && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Input
                label="Mật khẩu *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                  }
                })}
              />
              <button
                type="button"
                className="absolute top-8 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Input
              label="Xác nhận mật khẩu *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Xác nhận mật khẩu là bắt buộc',
                validate: (value) => {
                  const password = watch('password')
                  return value === password || 'Mật khẩu xác nhận không khớp'
                }
              })}
            />
          </div>
        </div>
      )}

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Địa chỉ"
            placeholder="Nhập địa chỉ"
            {...register('address')}
          />
        </div>
      </div>

      {/* Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vai trò *
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('role', {
              required: 'Vai trò là bắt buộc'
            })}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái *
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('isActive', {
              required: 'Trạng thái là bắt buộc'
            })}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.isActive && (
            <p className="text-sm text-red-600 mt-1">{errors.isActive.message}</p>
          )}
        </div>
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
          {user?.id ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  )
}

export default UserForm
