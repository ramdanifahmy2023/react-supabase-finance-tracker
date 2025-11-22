import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

interface FinancialSummary {
  total_income: number
  total_expenses: number
  net_profit: number
  transaction_count: number
  avg_transaction: number
  highest_income: number
  highest_expense: number
}

interface MonthlySummary {
  month: string
  income: number
  expenses: number
  net_profit: number
}

interface CategoryTotal {
  category_name: string
  category_type: 'income' | 'expense'
  total_amount: number
  transaction_count: number
}

interface RecentTransaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string | null
  date: string
  category_name: string
  category_type: 'income' | 'expense'
}

interface DailySummary {
  day: string
  income: number
  expenses: number
  net_profit: number
}

export function useFinancialSummary() {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async (): Promise<FinancialSummary> => {
      const { data, error } = await supabase.rpc('get_financial_summary', {
        p_user_id: profile?.role === 'staff' ? profile.user_id : null
      })

      if (error) throw error

      return data[0] || {
        total_income: 0,
        total_expenses: 0,
        net_profit: 0,
        transaction_count: 0,
        avg_transaction: 0,
        highest_income: 0,
        highest_expense: 0
      }
    },
    enabled: !!profile,
  })
}

export function useMonthlySummary(months: number = 6) {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ['monthly-summary', months],
    queryFn: async (): Promise<MonthlySummary[]> => {
      const { data, error } = await supabase.rpc('get_monthly_summary', {
        p_months: months,
        p_user_id: profile?.role === 'staff' ? profile.user_id : null
      })

      if (error) throw error

      return data || []
    },
    enabled: !!profile,
  })
}

export function useCategoryTotals() {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ['category-totals'],
    queryFn: async (): Promise<CategoryTotal[]> => {
      const { data, error } = await supabase.rpc('get_category_totals', {
        p_user_id: profile?.role === 'staff' ? profile.user_id : null
      })

      if (error) throw error

      return data || []
    },
    enabled: !!profile,
  })
}

export function useRecentTransactions(limit: number = 10) {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async (): Promise<RecentTransaction[]> => {
      const { data, error } = await supabase.rpc('get_recent_transactions', {
        p_limit: limit,
        p_user_id: profile?.role === 'staff' ? profile.user_id : null
      })

      if (error) throw error

      return data || []
    },
    enabled: !!profile,
  })
}

export function useDailySummary(days: number = 30) {
  const { profile } = useAuth()

  return useQuery({
    queryKey: ['daily-summary', days],
    queryFn: async (): Promise<DailySummary[]> => {
      const { data, error } = await supabase.rpc('get_daily_summary', {
        p_days: days,
        p_user_id: profile?.role === 'staff' ? profile.user_id : null
      })

      if (error) throw error

      return data || []
    },
    enabled: !!profile,
  })
}