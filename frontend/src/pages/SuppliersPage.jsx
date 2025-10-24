import React from 'react'
import { Helmet } from 'react-helmet-async'
import SupplierList from '@features/Suppliers/components/SupplierList'

const SuppliersPage = () => {
  return (
    <>
      <Helmet>
        <title>Nhà cung cấp - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <SupplierList />
      </div>
    </>
  )
}

export default SuppliersPage
