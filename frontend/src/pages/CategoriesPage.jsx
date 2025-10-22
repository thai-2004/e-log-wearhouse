import React from 'react'
import { Helmet } from 'react-helmet-async'

const CategoriesPage = () => {
  return (
    <>
      <Helmet>
        <title>Danh mục - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổ chức sản phẩm của bạn theo danh mục.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý danh mục sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default CategoriesPage
