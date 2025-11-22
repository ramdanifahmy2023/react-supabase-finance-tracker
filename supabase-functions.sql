-- SQL Functions for Enhanced Financial Analytics

-- Function to get monthly financial summary
CREATE OR REPLACE FUNCTION get_monthly_summary(
  p_months INTEGER DEFAULT 6,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  month TEXT,
  income DECIMAL,
  expenses DECIMAL,
  net_profit DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_date DATE := CURRENT_DATE;
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT
      DATE_TRUNC('month', date) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS net_profit
    FROM transactions
    WHERE
      date >= DATE_TRUNC('month', v_current_date - INTERVAL '1 month' * (p_months - 1))
      AND date <= DATE_TRUNC('month', v_current_date) + INTERVAL '1 month' - INTERVAL '1 day'
      AND (p_user_id IS NULL OR user_id = p_user_id)
    GROUP BY DATE_TRUNC('month', date)
  )
  SELECT
    TO_CHAR(month, 'Mon YYYY') AS month,
    income,
    expenses,
    net_profit
  FROM monthly_data
  ORDER BY month;
END;
$$;

-- Function to get category totals
CREATE OR REPLACE FUNCTION get_category_totals(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  category_name TEXT,
  category_type TEXT,
  total_amount DECIMAL,
  transaction_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.name AS category_name,
    c.type AS category_type,
    COALESCE(SUM(t.amount), 0) AS total_amount,
    COALESCE(COUNT(t.id), 0) AS transaction_count
  FROM categories c
  LEFT JOIN transactions t ON c.id = t.category_id
    AND (p_user_id IS NULL OR t.user_id = p_user_id)
  GROUP BY c.id, c.name, c.type
  ORDER BY c.type, total_amount DESC;
END;
$$;

-- Function to get financial summary for dashboard
CREATE OR REPLACE FUNCTION get_financial_summary(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_income DECIMAL,
  total_expenses DECIMAL,
  net_profit DECIMAL,
  transaction_count INTEGER,
  avg_transaction DECIMAL,
  highest_income DECIMAL,
  highest_expense DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS net_profit,
    COALESCE(COUNT(*), 0) AS transaction_count,
    CASE
      WHEN COUNT(*) > 0 THEN COALESCE(AVG(amount), 0)
      ELSE 0
    END AS avg_transaction,
    COALESCE(MAX(CASE WHEN type = 'income' THEN amount END), 0) AS highest_income,
    COALESCE(MAX(CASE WHEN type = 'expense' THEN amount END), 0) AS highest_expense
  FROM transactions
  WHERE p_user_id IS NULL OR user_id = p_user_id;
END;
$$;

-- Function to get recent transactions
CREATE OR REPLACE FUNCTION get_recent_transactions(
  p_limit INTEGER DEFAULT 10,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  amount DECIMAL,
  type TEXT,
  description TEXT,
  date DATE,
  category_name TEXT,
  category_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.amount,
    t.type,
    t.description,
    t.date,
    c.name AS category_name,
    c.type AS category_type
  FROM transactions t
  JOIN categories c ON t.category_id = c.id
  WHERE (p_user_id IS NULL OR t.user_id = p_user_id)
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to get daily summary for the last 30 days
CREATE OR REPLACE FUNCTION get_daily_summary(
  p_days INTEGER DEFAULT 30,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  day DATE,
  income DECIMAL,
  expenses DECIMAL,
  net_profit DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE := CURRENT_DATE - INTERVAL '1 day' * (p_days - 1);
BEGIN
  RETURN QUERY
  WITH daily_data AS (
    SELECT
      d.day,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS net_profit
    FROM (
      SELECT generate_series(v_start_date, CURRENT_DATE, INTERVAL '1 day')::DATE AS day
    ) d
    LEFT JOIN transactions t ON d.day = t.date
      AND (p_user_id IS NULL OR t.user_id = p_user_id)
    GROUP BY d.day
  )
  SELECT
    day,
    income,
    expenses,
    net_profit
  FROM daily_data
  ORDER BY day;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_monthly_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_totals TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_summary TO authenticated;