import React from 'react'
import { Helmet } from 'react-helmet-async'

const OutboundPage = () => {
  return (
    <>
      <Helmet>
        <title>Xuất kho - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xuất kho</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các lô hàng xuất và phân phối tồn kho.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý xuất kho sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default OutboundPage
