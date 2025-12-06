import React from 'react'
import { Helmet } from 'react-helmet-async'
import { RegisterForm } from '@features/Auth'

const RegisterPage = () => {
  return (
    <>
      <Helmet>
        <title>Đăng ký - E-Log</title>
      </Helmet>
      <RegisterForm />
    </>
  )
}

export default RegisterPage

