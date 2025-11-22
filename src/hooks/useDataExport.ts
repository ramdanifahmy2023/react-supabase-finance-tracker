import jsPDF from 'jspdf'
import Papa from 'papaparse'
import { useTransactions } from './useTransactions'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface ExportOptions {
  startDate?: string
  endDate?: string
  categoryIds?: string[]
  transactionType?: 'income' | 'expense' | 'all'
  format: 'csv' | 'pdf'
  includeCharts?: boolean
  companyName?: string
}

interface ExportedTransaction {
  date: string
  type: 'Income' | 'Expense'
  category: string
  description: string
  amount: number
  formattedAmount: string
}

export function useDataExport() {
  const { transactions } = useTransactions()
  const { profile } = useAuth()

  const filterTransactions = (options: ExportOptions) => {
    return transactions.filter(transaction => {
      // Date range filter
      if (options.startDate && transaction.date < options.startDate) return false
      if (options.endDate && transaction.date > options.endDate) return false

      // Category filter
      if (options.categoryIds && options.categoryIds.length > 0) {
        if (!options.categoryIds.includes(transaction.category_id)) return false
      }

      // Type filter
      if (options.transactionType && options.transactionType !== 'all') {
        if (transaction.type !== options.transactionType) return false
      }

      return true
    })
  }

  const formatTransactionsForExport = (filteredTransactions: any[]): ExportedTransaction[] => {
    return filteredTransactions.map(transaction => ({
      date: format(new Date(transaction.date), 'dd MMM yyyy'),
      type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) as 'Income' | 'Expense',
      category: transaction.categories.name,
      description: transaction.description || 'No description',
      amount: transaction.amount,
      formattedAmount: `${transaction.type === 'income' ? '+' : '-'}Rp ${transaction.amount.toLocaleString('id-ID')}`
    }))
  }

  const exportToCSV = (data: ExportedTransaction[], options: ExportOptions) => {
    const csvData = Papa.unparse(data, {
      header: true,
      columns: [
        { title: 'Date', key: 'date' },
        { title: 'Type', key: 'type' },
        { title: 'Category', key: 'category' },
        { title: 'Description', key: 'description' },
        { title: 'Amount', key: 'formattedAmount' }
      ]
    })

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = (data: ExportedTransaction[], options: ExportOptions) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    let yPosition = 20

    // Add header
    doc.setFontSize(20)
    doc.text('Financial Report', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15
    doc.setFontSize(12)

    if (options.companyName || profile?.company_name) {
      doc.text(`Company: ${options.companyName || profile?.company_name}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
    }

    if (options.startDate && options.endDate) {
      doc.text(`Period: ${format(new Date(options.startDate), 'dd MMM yyyy')} - ${format(new Date(options.endDate), 'dd MMM yyyy')}`, pageWidth / 2, yPosition, { align: 'center' })
    } else {
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, pageWidth / 2, yPosition, { align: 'center' })
    }

    yPosition += 20

    // Add summary
    const totalIncome = data.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = data.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)
    const netProfit = totalIncome - totalExpenses

    doc.setFontSize(14)
    doc.text('Summary', 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.text(`Total Income: Rp ${totalIncome.toLocaleString('id-ID')}`, 20, yPosition)
    yPosition += 7
    doc.text(`Total Expenses: Rp ${totalExpenses.toLocaleString('id-ID')}`, 20, yPosition)
    yPosition += 7
    doc.text(`Net Profit: Rp ${netProfit.toLocaleString('id-ID')}`, 20, yPosition)
    yPosition += 7
    doc.text(`Total Transactions: ${data.length}`, 20, yPosition)

    yPosition += 20

    // Add table header
    doc.setFontSize(12)
    doc.text('Transactions', 20, yPosition)
    yPosition += 10

    // Table setup
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const columnWidth = [30, 25, 40, 60, 35]
    let xPos = 20

    // Draw table headers
    doc.setFontSize(10)
    headers.forEach((header, index) => {
      doc.text(header, xPos, yPosition)
      xPos += columnWidth[index]
    })
    yPosition += 7

    // Draw separator line
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 7

    // Add transactions
    doc.setFontSize(9)
    data.forEach((transaction, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20

        // Redraw headers on new page
        xPos = 20
        doc.setFontSize(10)
        headers.forEach((header, headerIndex) => {
          doc.text(header, xPos, yPosition)
          xPos += columnWidth[headerIndex]
        })
        yPosition += 7
        doc.line(20, yPosition, pageWidth - 20, yPosition)
        yPosition += 7
        doc.setFontSize(9)
      }

      xPos = 20
      const row = [
        transaction.date,
        transaction.type,
        transaction.category,
        transaction.description || '',
        transaction.formattedAmount
      ]

      row.forEach((cell, cellIndex) => {
        const maxWidth = columnWidth[cellIndex] - 2
        const text = doc.splitTextToSize(cell, maxWidth)

        if (text.length > 1) {
          // Handle multiline text
          text.forEach((line: string, lineIndex: number) => {
            if (lineIndex === 0) {
              doc.text(line, xPos, yPosition)
            } else {
              yPosition += 5
              doc.text(line, xPos, yPosition)
            }
          })
        } else {
          doc.text(text[0], xPos, yPosition)
        }
        xPos += columnWidth[cellIndex]
      })

      yPosition += 7
    })

    // Add footer
    const footerY = doc.internal.pageSize.height - 10
    doc.setFontSize(8)
    doc.text(`Generated by Finance Tracker on ${format(new Date(), 'dd MMM yyyy HH:mm')}`, pageWidth / 2, footerY, { align: 'center' })

    // Save the PDF
    doc.save(`financial_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const exportData = (options: ExportOptions) => {
    const filteredTransactions = filterTransactions(options)
    const formattedData = formatTransactionsForExport(filteredTransactions)

    if (formattedData.length === 0) {
      alert('No transactions found for the selected criteria.')
      return
    }

    if (options.format === 'csv') {
      exportToCSV(formattedData, options)
    } else if (options.format === 'pdf') {
      exportToPDF(formattedData, options)
    }
  }

  return {
    exportData,
    exportToCSV: (data: ExportedTransaction[], options: ExportOptions) => exportToCSV(data, options),
    exportToPDF: (data: ExportedTransaction[], options: ExportOptions) => exportToPDF(data, options),
    filterTransactions,
    formatTransactionsForExport
  }
}