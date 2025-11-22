import React, { useState } from 'react'
import { useDataExport } from '@/hooks/useDataExport'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Table, Calendar, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface ExportOptions {
  startDate?: string
  endDate?: string
  categoryIds?: string[]
  transactionType?: 'income' | 'expense' | 'all'
  format: 'csv' | 'pdf'
}

interface DataExportButtonsProps {
  className?: string
}

export function DataExportButtons({ className }: DataExportButtonsProps) {
  const { exportData } = useDataExport()
  const { categories } = useCategories()
  const [showFilters, setShowFilters] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    transactionType: 'all'
  })

  const handleExport = () => {
    exportData(exportOptions)
  }

  const handleQuickExport = (format: 'csv' | 'pdf', period?: 'month' | 'year' | 'all') => {
    let startDate: string | undefined
    let endDate: string | undefined

    if (period === 'month') {
      const now = new Date()
      startDate = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd')
      endDate = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd')
    } else if (period === 'year') {
      const now = new Date()
      startDate = format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd')
      endDate = format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd')
    }

    exportData({
      ...exportOptions,
      format,
      startDate,
      endDate
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Export your financial data in CSV or PDF format
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleQuickExport('csv', 'all')}
            className="justify-start"
          >
            <Table className="h-4 w-4 mr-2" />
            Export All (CSV)
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickExport('pdf', 'all')}
            className="justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export All (PDF)
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickExport('csv', 'month')}
            className="justify-start"
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Month (CSV)
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickExport('pdf', 'month')}
            className="justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            This Month (PDF)
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickExport('csv', 'year')}
            className="justify-start"
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Year (CSV)
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickExport('pdf', 'year')}
            className="justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            This Year (PDF)
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h4 className="font-medium text-sm">Advanced Filters</h4>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={exportOptions.startDate || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    startDate: e.target.value || undefined
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={exportOptions.endDate || ''}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    endDate: e.target.value || undefined
                  }))}
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={exportOptions.transactionType}
                onValueChange={(value: 'income' | 'expense' | 'all') => setExportOptions(prev => ({
                  ...prev,
                  transactionType: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={exportOptions.categoryIds?.includes(category.id) || false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExportOptions(prev => ({
                            ...prev,
                            categoryIds: [...(prev.categoryIds || []), category.id]
                          }))
                        } else {
                          setExportOptions(prev => ({
                            ...prev,
                            categoryIds: prev.categoryIds?.filter(id => id !== category.id) || []
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={category.id} className="text-sm cursor-pointer">
                      {category.name}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {category.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="csv"
                    checked={exportOptions.format === 'csv'}
                    onCheckedChange={() => setExportOptions(prev => ({
                      ...prev,
                      format: 'csv'
                    }))}
                  />
                  <Label htmlFor="csv" className="cursor-pointer">CSV (Spreadsheet)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf"
                    checked={exportOptions.format === 'pdf'}
                    onCheckedChange={() => setExportOptions(prev => ({
                      ...prev,
                      format: 'pdf'
                    }))}
                  />
                  <Label htmlFor="pdf" className="cursor-pointer">PDF (Report)</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button onClick={handleExport} className="w-full" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </CardContent>
    </Card>
  )
}