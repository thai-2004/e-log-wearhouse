import React from 'react'
import { Helmet } from 'react-helmet-async'
import { ReportList } from '@features/Reports'

const ReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Báo cáo - E-Log</title>
      </Helmet>

      <div className="space-y-6">
        <ReportList />
      </div>
    </>
  )
}

export default ReportsPage
