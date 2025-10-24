import React from 'react'
import { Helmet } from 'react-helmet-async'
import WarehouseList from '@features/Warehouses/components/WarehouseList'

const WarehousesPage = () => {
  return (
    <>
      <Helmet>
        <title>Kho hàng - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <WarehouseList />
      </div>
    </>
  )
}

export default WarehousesPage
