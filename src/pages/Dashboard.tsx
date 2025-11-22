import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FinancialChart } from '@/components/charts/FinancialChart'
import { signOut } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { dashboardData, isLoading } = useDashboardData()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/login')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Tracker</h1>
              {profile?.company_name && (
                <p className="text-sm text-gray-500">{profile.company_name}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} • Role: {profile?.role}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your finances today.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{formatCurrency(dashboardData?.totalIncome || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total income from all transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboardData?.totalExpenses || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total expenses from all transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (dashboardData?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(dashboardData?.netProfit || 0) >= 0 ? '+' : ''}{formatCurrency(dashboardData?.netProfit || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Income minus expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.transactionCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total number of transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/transactions')}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/transactions')}
              >
                <ArrowDownRight className="mr-2 h-4 w-4" />
                View All Transactions
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/reports')}
              >
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions yet. Start by adding your first income or expense!
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className={`h-4 w-4 text-green-600`} />
                          ) : (
                            <TrendingDown className={`h-4 w-4 text-red-600`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {transaction.category_name}
                            </Badge>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(transaction.date), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  {dashboardData?.recentTransactions.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => navigate('/transactions')}
                    >
                      View All Transactions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Charts */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Financial Analytics</h3>
          </div>

          {dashboardData && (
            <FinancialChart
              monthlyData={dashboardData.monthlyData}
              categoryData={dashboardData.categoryData}
            />
          )}
        </div>
      </main>
    </div>
  )
}