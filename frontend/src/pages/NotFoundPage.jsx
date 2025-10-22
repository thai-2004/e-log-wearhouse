import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Không tìm thấy trang - E-Log</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-primary-600">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Không tìm thấy trang
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiHome className="mr-2 h-4 w-4" />
                Đi đến Bảng điều khiển
              </Link>
              <button
                onClick={() => window.history.back()}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage
