import React from 'react'
import { Helmet } from 'react-helmet-async'
import CustomerList from '@features/Customers/components/CustomerList'

const CustomersPage = () => {
  return (
    <>
      <Helmet>
        <title>Khách hàng - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <CustomerList />
      </div>
    </>
  )
}

export default CustomersPage