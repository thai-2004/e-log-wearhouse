import React from 'react'
import { Helmet } from 'react-helmet-async'
import CategoryList from '@features/Categories/components/CategoryList'

const CategoriesPage = () => {
  return (
    <>
      <Helmet>
        <title>Danh mục - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <CategoryList />
      </div>
    </>
  )
}

export default CategoriesPage
