import React from 'react'
import { Helmet } from 'react-helmet-async'

const AuthLayout = ({ children, title = 'Authentication' }) => {
  return (
    <>
      <Helmet>
        <title>{title} - E-Log</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            E-Log Warehouse Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Modern warehouse management system
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout
