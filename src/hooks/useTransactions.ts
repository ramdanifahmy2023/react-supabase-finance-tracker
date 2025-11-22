import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Database } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

const TRANSACTIONS_QUERY_KEY = ['transactions']

export function useTransactions() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            type
          )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply role-based filtering
      if (profile?.role === 'staff') {
        query = query.eq('user_id', profile.user_id)
      } else if (profile?.role === 'leader' || profile?.role === 'superadmin') {
        // Leaders and superadmins can see all transactions
        // No additional filter needed
      }

      const { data, error } = await query

      if (error) throw error

      return data as (Transaction & { categories: { name: string; type: string } })[]
    },
    enabled: !!profile,
  })

  // Real-time subscription for transactions
  React.useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: profile?.role === 'staff' ? `user_id=eq.${profile.user_id}` : undefined,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, queryClient])

  return {
    transactions,
    isLoading,
    error,
  }
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TransactionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
    },
  })
}