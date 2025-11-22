import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, useIsSuperAdmin, useIsLeader, useIsStaff } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'superadmin' | 'leader' | 'staff'
  requireSuperAdmin?: boolean
  requireLeader?: boolean
  requireStaff?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireSuperAdmin = false,
  requireLeader = false,
  requireStaff = false,
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const isSuperAdmin = useIsSuperAdmin()
  const isLeader = useIsLeader()
  const isStaff = useIsStaff()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  let hasAccess = true

  if (requiredRole) {
    switch (requiredRole) {
      case 'superadmin':
        hasAccess = isSuperAdmin
        break
      case 'leader':
        hasAccess = isLeader || isSuperAdmin
        break
      case 'staff':
        hasAccess = isStaff || isLeader || isSuperAdmin
        break
    }
  } else {
    if (requireSuperAdmin) {
      hasAccess = isSuperAdmin
    } else if (requireLeader) {
      hasAccess = isLeader || isSuperAdmin
    } else if (requireStaff) {
      hasAccess = isStaff || isLeader || isSuperAdmin
    }
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Helper components for specific role requirements
export function SuperAdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requireSuperAdmin fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function LeaderOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requireLeader fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function StaffOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requireStaff fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}