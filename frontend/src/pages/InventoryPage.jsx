import React from 'react'
import { Helmet } from 'react-helmet-async'

const InventoryPage = () => {
  return (
    <>
      <Helmet>
        <title>Tồn kho - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tồn kho</h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi và quản lý mức tồn kho của bạn.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý tồn kho sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default InventoryPage
