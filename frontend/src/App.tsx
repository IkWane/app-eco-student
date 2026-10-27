import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout.tsx'
import { CategoriesPage } from './pages/CategoriesPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { ExpensesPage } from './pages/ExpensesPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Route>
    </Routes>
  )
}

export default App
