import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getCurrentUser, onAuthStateChange } from '@/lib/auth'
import type { Database } from '@/lib/supabaseClient'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    setLoading(true)
    try {
      const result = await getCurrentUser()
      setUser(result.user)
      setProfile(result.profile)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const result = await getCurrentUser()
        setUser(result.user)
        setProfile(result.profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hooks for role-based access control
export function useUserRole() {
  const { profile } = useAuth()
  return profile?.role || null
}

export function useIsSuperAdmin() {
  const role = useUserRole()
  return role === 'superadmin'
}

export function useIsLeader() {
  const role = useUserRole()
  return role === 'leader'
}

export function useIsStaff() {
  const role = useUserRole()
  return role === 'staff'
}

export function useCanManageTeam() {
  const role = useUserRole()
  return role === 'superadmin' || role === 'leader'
}

export function useCanViewAllData() {
  const role = useUserRole()
  return role === 'superadmin' || role === 'leader'
}