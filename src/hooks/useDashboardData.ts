import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  transactionCount: number
  monthlyData: {
    month: string
    income: number
    expenses: number
  }[]
  categoryData: {
    name: string
    amount: number
    type: 'income' | 'expense'
  }[]
  recentTransactions: {
    id: string
    amount: number
    type: 'income' | 'expense'
    description: string | null
    date: string
    category_name: string
  }[]
}

const DASHBOARD_QUERY_KEY = ['dashboard']

export function useDashboardData() {
  const { profile } = useAuth()

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async (): Promise<DashboardSummary> => {
      if (!profile) {
        throw new Error('User profile not found')
      }

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      // Get all transactions with role-based filtering
      let transactionsQuery = supabase
        .from('transactions')
        .select(`
          *,
          categories!inner (
            name,
            type
          )
        `)

      if (profile.role === 'staff') {
        transactionsQuery = transactionsQuery.eq('user_id', profile.user_id)
      }

      const { data: transactions, error: transactionsError } = await transactionsQuery

      if (transactionsError) throw transactionsError

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const netProfit = totalIncome - totalExpenses

      // Calculate monthly data for the last 6 months
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1)
        const monthStart = month.toISOString().split('T')[0]
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0]

        const monthTransactions = transactions.filter(t =>
          t.date >= monthStart && t.date <= monthEnd
        )

        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        monthlyData.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: monthIncome,
          expenses: monthExpenses,
        })
      }

      // Calculate category totals
      const categoryMap = new Map<string, { amount: number; type: 'income' | 'expense' }>()

      transactions.forEach(transaction => {
        const key = transaction.categories.name
        const existing = categoryMap.get(key) || { amount: 0, type: transaction.type }
        categoryMap.set(key, {
          amount: existing.amount + transaction.amount,
          type: transaction.type
        })
      })

      const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        amount: data.amount,
        type: data.type
      }))

      // Get recent transactions (last 10)
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          amount: t.amount,
          type: t.type as 'income' | 'expense',
          description: t.description,
          date: t.date,
          category_name: t.categories.name,
        }))

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        transactionCount: transactions.length,
        monthlyData,
        categoryData,
        recentTransactions,
      }
    },
    enabled: !!profile,
  })

  return {
    dashboardData,
    isLoading,
    error,
  }
}