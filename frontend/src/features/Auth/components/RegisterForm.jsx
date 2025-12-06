import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiCheck } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useRegister } from '../hooks/useAuth'

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      // Map form data to API format
      const registerData = {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      }
      
      await registerMutation.mutateAsync(registerData)
      // Navigate to login after successful registration
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Tạo tài khoản mới
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Điền thông tin để tạo tài khoản mới
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Input
              label="Họ và tên"
              type="text"
              autoComplete="name"
              placeholder="Nhập họ và tên của bạn"
              error={errors.fullName?.message}
              {...register('fullName', {
                required: 'Họ và tên là bắt buộc',
                minLength: {
                  value: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự',
                },
                maxLength: {
                  value: 100,
                  message: 'Họ và tên không được vượt quá 100 ký tự',
                },
              })}
            />
          </div>

          <div>
            <Input
              label="Tên đăng nhập"
              type="text"
              autoComplete="username"
              placeholder="Nhập tên đăng nhập của bạn"
              error={errors.username?.message}
              {...register('username', {
                required: 'Tên đăng nhập là bắt buộc',
                minLength: {
                  value: 3,
                  message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
                },
                maxLength: {
                  value: 30,
                  message: 'Tên đăng nhập không được vượt quá 30 ký tự',
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
                },
              })}
            />
          </div>
        </div>

      <div>
        <Input
          label="Địa chỉ email"
          type="email"
          autoComplete="email"
          placeholder="Nhập email của bạn"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email là bắt buộc',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Địa chỉ email không hợp lệ',
            },
          })}
        />
      </div>

      <div>
        <Input
          label="Số điện thoại"
          type="tel"
          autoComplete="tel"
          placeholder="Nhập số điện thoại của bạn (tùy chọn)"
          error={errors.phone?.message}
          {...register('phone', {
            pattern: {
              value: /^[0-9+\-\s()]+$/,
              message: 'Số điện thoại không hợp lệ',
            },
            minLength: {
              value: 10,
              message: 'Số điện thoại phải có ít nhất 10 số',
            },
            maxLength: {
              value: 15,
              message: 'Số điện thoại không được vượt quá 15 ký tự',
            },
          })}
        />
      </div>

      <div>
        <div className="relative">
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Nhập mật khẩu của bạn (tối thiểu 6 ký tự)"
            error={errors.password?.message}
            {...register('password', {
              required: 'Mật khẩu là bắt buộc',
              minLength: {
                value: 6,
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
              },
              maxLength: {
                value: 50,
                message: 'Mật khẩu không được vượt quá 50 ký tự',
              },
            })}
          />
          <button
            type="button"
            className="absolute top-9 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Mật khẩu phải có ít nhất 6 ký tự
        </p>
      </div>

      <div>
        <div className="relative">
          <Input
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu để xác nhận"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu',
              validate: (value) =>
                value === password || 'Mật khẩu không khớp',
            })}
          />
          <button
            type="button"
            className="absolute top-9 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agree-terms"
            name="agree-terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('agreeTerms', {
              required: 'Bạn phải đồng ý với điều khoản và điều kiện',
            })}
          />
        </div>
        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
          Tôi đồng ý với{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500 underline">
            Điều khoản và điều kiện
          </Link>{' '}
          và{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500 underline">
            Chính sách bảo mật
          </Link>
        </label>
      </div>
      {errors.agreeTerms && (
        <p className="text-sm text-red-600 mt-1">{errors.agreeTerms.message}</p>
      )}

      <div>
        <Button
          type="submit"
          className="w-full"
          loading={registerMutation.isLoading}
          disabled={registerMutation.isLoading}
        >
          Tạo tài khoản
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
    </div>
  )
}

export default RegisterForm
