import React from 'react'
import { Helmet } from 'react-helmet-async'

const ProfilePage = () => {
  return (
    <>
      <Helmet>
        <title>Hồ sơ - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý cài đặt tài khoản và tùy chọn của bạn.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Quản lý hồ sơ sẽ được triển khai tại đây</p>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
