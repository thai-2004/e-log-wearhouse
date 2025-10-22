import React from 'react'
import { Helmet } from 'react-helmet-async'
import { LoginForm } from '@features/Auth'

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Đăng nhập - E-Log</title>
      </Helmet>
      <LoginForm />
    </>
  )
}

export default LoginPage
