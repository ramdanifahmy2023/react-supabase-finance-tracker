import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

type AuthUser = Database['public']['Tables']['profiles']['Row']

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign in'
    }
  }
}

export async function signUp(email: string, password: string, companyName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
        }
      }
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign up'
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign out'
    }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send reset email'
    }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update password'
    }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) return { user: null, profile: null }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) throw profileError

    return { user, profile }
  } catch (error: any) {
    console.error('Error getting current user:', error)
    return { user: null, profile: null, error }
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}