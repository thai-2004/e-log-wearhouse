import React from 'react'
import { Helmet } from 'react-helmet-async'
import { ForgotPasswordForm } from '@features/Auth'

const ForgotPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Quên mật khẩu - E-Log</title>
      </Helmet>
      <ForgotPasswordForm />
    </>
  )
}

export default ForgotPasswordPage

