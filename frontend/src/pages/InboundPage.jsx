import React from 'react'
import { Helmet } from 'react-helmet-async'
import InboundList from '@features/Inbound/components/InboundList'

const InboundPage = () => {
  return (
    <>
      <Helmet>
        <title>Nhập kho - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <InboundList />
      </div>
    </>
  )
}

export default InboundPage
