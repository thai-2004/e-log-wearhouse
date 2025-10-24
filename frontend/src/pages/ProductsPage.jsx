import React from 'react'
import { Helmet } from 'react-helmet-async'
import ProductList from '@features/Products/components/ProductList'

const ProductsPage = () => {
  return (
    <>
      <Helmet>
        <title>Sản phẩm - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <ProductList />
      </div>
    </>
  )
}

export default ProductsPage
