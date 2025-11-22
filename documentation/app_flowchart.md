flowchart TD
    Start[Start] --> Login[Login Page]
    Login --> Dashboard[Dashboard]
    Login --> Signup[Signup Page]
    Signup --> Login
    Dashboard --> IncomeList[Income Page]
    Dashboard --> ExpenseList[Expense Page]
    Dashboard --> ReportsPage[Reports Page]
    Dashboard --> Settings[Settings]
    Dashboard --> Logout[Logout]
    IncomeList --> AddIncome[Add Income Dialog]
    AddIncome --> IncomeList
    ExpenseList --> AddExpense[Add Expense Dialog]
    AddExpense --> ExpenseList
    ReportsPage --> Filter[Filter Transactions]
    Filter --> ReportsPage