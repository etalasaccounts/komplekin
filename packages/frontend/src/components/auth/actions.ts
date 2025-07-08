'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  // Hanya mengambil email dan password untuk login
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error?message=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const terms = formData.get('terms') === 'on' ? true : false
  
  if (!terms) {
    redirect('/error?message=Please accept the terms and conditions')
    return
  }

  // Data untuk signup dengan metadata user
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
        terms_condition: terms,
        terms_accepted_at: new Date().toISOString()
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/auth/verify?status=success`
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error?message=' + error.message)
  }

  redirect('/auth/verify?message=Please check your email to verify your account. The verification link will expire in 24 hours.')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
  })

  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }
  redirect('/auth/verify?message=Please check your email for a password reset link.')
}
