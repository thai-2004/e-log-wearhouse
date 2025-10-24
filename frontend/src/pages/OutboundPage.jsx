import React from 'react'
import { Helmet } from 'react-helmet-async'
import OutboundList from '@features/Outbound/components/OutboundList'

const OutboundPage = () => {
  return (
    <>
      <Helmet>
        <title>Xuất kho - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <OutboundList />
      </div>
    </>
  )
}

export default OutboundPage
