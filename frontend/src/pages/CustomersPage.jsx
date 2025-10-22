import React from 'react'
import { Helmet } from 'react-helmet-async'

const CustomersPage = () => {
  return (
    <>
      <Helmet>
        <title>Khách hàng - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin và mối quan hệ với khách hàng.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý khách hàng sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default CustomersPage