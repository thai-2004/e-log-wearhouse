import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useLogin } from '../hooks/useAuth'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    console.log('LoginForm: Starting login with data:', data)
    try {
      const result = await loginMutation.mutateAsync(data)
      console.log('LoginForm: Login successful, result:', result)
      console.log('LoginForm: Navigating to dashboard...')
      // Navigate immediately after successful login
      navigate('/dashboard')
    } catch (error) {
      console.error('LoginForm: Login failed:', error)
      // Error is handled in the hook
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          label="Username hoặc Email"
          type="text"
          autoComplete="username"
          placeholder="Nhập username hoặc email"
          error={errors.username?.message}
          {...register('username', {
            required: 'Username hoặc email là bắt buộc',
            minLength: {
              value: 3,
              message: 'Username phải có ít nhất 3 ký tự',
            },
          })}
        />
      </div>

      <div>
        <div className="relative">
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu của bạn"
            error={errors.password?.message}
            {...register('password', {
              required: 'Mật khẩu là bắt buộc',
              minLength: {
                value: 6,
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
              },
            })}
          />
          <button
            type="button"
            className="absolute top-9 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FiEyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <FiEye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Ghi nhớ đăng nhập
          </label>
        </div>

        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full"
          loading={loginMutation.isLoading}
          disabled={loginMutation.isLoading}
        >
          Đăng nhập
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </form>
  )
}

export default LoginForm
