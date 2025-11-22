import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  type: z.enum(['income', 'expense'], { required_error: 'Please select transaction type' }),
  category_id: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: {
    id: string
    amount: number
    type: 'income' | 'expense'
    category_id: string
    description: string | null
    date: string
  }
}

export function TransactionForm({ onSuccess, onCancel, initialData }: TransactionFormProps) {
  const { profile } = useAuth()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const [error, setError] = React.useState<string | null>(null)
  const [transactionType, setTransactionType] = React.useState<'income' | 'expense'>(
    initialData?.type || 'expense'
  )

  const { categories } = useCategories(transactionType)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      amount: initialData.amount.toString(),
      type: initialData.type,
      category_id: initialData.category_id,
      description: initialData.description || '',
      date: initialData.date,
    } : {
      amount: '',
      type: 'expense',
      category_id: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (selectedType !== transactionType) {
      setTransactionType(selectedType)
      setValue('category_id', '') // Clear category when type changes
    }
  }, [selectedType, transactionType, setValue])

  const onSubmit = async (data: TransactionFormData) => {
    setError(null)

    try {
      const transactionData = {
        ...data,
        amount: Number(data.amount),
        user_id: profile!.user_id,
      }

      if (initialData) {
        await updateTransaction.mutateAsync({
          id: initialData.id,
          ...transactionData,
        })
      } else {
        await createTransaction.mutateAsync(transactionData)
      }

      if (!initialData) {
        reset({
          amount: '',
          type: transactionType,
          category_id: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
        })
      }

      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction')
    }
  }

  const isIncome = transactionType === 'income'

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isIncome ? (
            <>
              <TrendingUp className="h-5 w-5 text-green-600" />
              Add Income
            </>
          ) : (
            <>
              <TrendingDown className="h-5 w-5 text-red-600" />
              Add Expense
            </>
          )}
        </CardTitle>
        <CardDescription>
          {initialData ? 'Edit the transaction details below.' : 'Enter the transaction details below.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  className="pl-9"
                  {...register('amount')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: 'income' | 'expense') => setValue('type', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select
              value={watch('category_id')}
              onValueChange={(value) => setValue('category_id', value)}
              disabled={isSubmitting || categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                disabled={isSubmitting}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Enter description"
                {...register('description')}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                initialData ? 'Update Transaction' : 'Add Transaction'
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}