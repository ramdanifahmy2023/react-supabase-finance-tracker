import React, { useState } from 'react'
import { DataExportButtons } from '@/components/DataExportButtons'
import { FinancialChart } from '@/components/charts/FinancialChart'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useFinancialSummary, useMonthlySummary } from '@/hooks/useFinancialSummary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function Reports() {
  const navigate = useNavigate()
  const { dashboardData, isLoading } = useDashboardData()
  const { data: summary } = useFinancialSummary()
  const { data: monthlyData } = useMonthlySummary(12)
  const [reportPeriod, setReportPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getFilteredMonthlyData = () => {
    if (!monthlyData) return []

    const now = new Date()
    let monthsToShow = 3

    if (reportPeriod === 'quarter') {
      monthsToShow = 3
    } else if (reportPeriod === 'year') {
      monthsToShow = 12
    }

    return monthlyData.slice(-monthsToShow)
  }

  const calculatePeriodGrowth = () => {
    if (!monthlyData || monthlyData.length < 2) return { income: 0, expenses: 0, profit: 0 }

    const currentPeriod = monthlyData[monthlyData.length - 1]
    const previousPeriod = monthlyData[monthlyData.length - 2]

    const incomeGrowth = previousPeriod.income > 0
      ? ((currentPeriod.income - previousPeriod.income) / previousPeriod.income) * 100
      : 0

    const expensesGrowth = previousPeriod.expenses > 0
      ? ((currentPeriod.expenses - previousPeriod.expenses) / previousPeriod.expenses) * 100
      : 0

    const profitGrowth = previousPeriod.net_profit !== 0
      ? ((currentPeriod.net_profit - previousPeriod.net_profit) / Math.abs(previousPeriod.net_profit)) * 100
      : 0

    return {
      income: incomeGrowth,
      expenses: expensesGrowth,
      profit: profitGrowth
    }
  }

  const growth = calculatePeriodGrowth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive financial reports and data export
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Report Period Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Period
            </CardTitle>
            <CardDescription>
              Select the time period for your report analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Quick Select</Label>
                <Select
                  value={reportPeriod}
                  onValueChange={(value: 'month' | 'quarter' | 'year') => setReportPeriod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customStartDate">Custom Start Date</Label>
                <Input
                  id="customStartDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customEndDate">Custom End Date</Label>
                <Input
                  id="customEndDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCustomStartDate('')
                    setCustomEndDate('')
                  }}
                  className="w-full"
                >
                  Clear Custom Range
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.total_income || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {growth.income >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                )}
                {Math.abs(growth.income).toFixed(1)}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.total_expenses || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {growth.expenses >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-red-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                )}
                {Math.abs(growth.expenses).toFixed(1)}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (summary?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary?.net_profit || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {growth.profit >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                )}
                {Math.abs(growth.profit).toFixed(1)}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {summary?.total_income && summary?.total_income > 0
                  ? (((summary.total_income - summary.total_expenses) / summary.total_income) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Profit margin percentage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {dashboardData && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Financial Analytics</h3>
            </div>
            <FinancialChart
              monthlyData={getFilteredMonthlyData()}
              categoryData={dashboardData.categoryData}
            />
          </div>
        )}

        {/* Export Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Export Reports</h3>
          </div>
          <DataExportButtons />
        </div>

        {/* Additional Reports Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Report Types</CardTitle>
              <CardDescription>
                Different formats for your reporting needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge variant="outline">CSV</Badge>
                <div>
                  <h4 className="font-medium">Spreadsheet Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect for data analysis in Excel, Google Sheets, or other spreadsheet applications.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge variant="outline">PDF</Badge>
                <div>
                  <h4 className="font-medium">Professional Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Formatted report with summaries, charts, and detailed transaction lists for presentations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Features</CardTitle>
              <CardDescription>
                Advanced filtering and customization options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Date range filtering</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Category-based filtering</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Transaction type selection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Company branding in PDFs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}