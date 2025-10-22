import React from 'react'
import { Helmet } from 'react-helmet-async'

const ReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Báo cáo - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tạo và xem báo cáo kinh doanh và phân tích.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Báo cáo sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default ReportsPage
