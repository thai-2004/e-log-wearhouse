import React from 'react'
import { Helmet } from 'react-helmet-async'

const SuppliersPage = () => {
  return (
    <>
      <Helmet>
        <title>Nhà cung cấp - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin và mối quan hệ với nhà cung cấp.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý nhà cung cấp sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default SuppliersPage
