import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import { useForgotPassword } from '../hooks/useAuth'

const ForgotPasswordForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email)
      setIsSubmitted(true)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email đã được gửi!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Chúng tôi đã gửi link khôi phục mật khẩu đến email của bạn.
            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Nếu không thấy email, vui lòng kiểm tra thư mục spam hoặc thử lại sau vài phút.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            Gửi lại email
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            <FiArrowLeft className="inline mr-2" />
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Quên mật khẩu?
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Nhập email của bạn và chúng tôi sẽ gửi link để khôi phục mật khẩu
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              label="Địa chỉ email"
              type="email"
              autoComplete="email"
              placeholder="Nhập email đã đăng ký"
              error={errors.email?.message}
              className="pl-10"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Địa chỉ email không hợp lệ',
                },
              })}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Chúng tôi sẽ gửi link khôi phục mật khẩu đến email này
          </p>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            loading={forgotPasswordMutation.isLoading}
            disabled={forgotPasswordMutation.isLoading}
          >
            Gửi link khôi phục
          </Button>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <FiArrowLeft className="mr-1 h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordForm

