import React from 'react'
import { Helmet } from 'react-helmet-async'
import InventoryList from '@features/Inventory/components/InventoryList'

const InventoryPage = () => {
  return (
    <>
      <Helmet>
        <title>Tồn kho - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <InventoryList />
      </div>
    </>
  )
}

export default InventoryPage
