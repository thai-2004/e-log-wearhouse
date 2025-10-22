import React from 'react'
import { Helmet } from 'react-helmet-async'

const UsersPage = () => {
  return (
    <>
      <Helmet>
        <title>Người dùng - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý tài khoản người dùng và quyền hạn.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý người dùng sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default UsersPage
