import React from 'react'
import { Helmet } from 'react-helmet-async'
import UserList from '@features/Users/components/UserList'

const UsersPage = () => {
  return (
    <>
      <Helmet>
        <title>Người dùng - E-Log</title>
      </Helmet>
      
      <div className="space-y-6">
        <UserList />
      </div>
    </>
  )
}

export default UsersPage
