import { useState, useEffect } from "react";
import LoginCard from "./components/auth/LogInCard";
import Layout from "@/components/dashboard/layout";
import PipelinesCard from "./components/dashboard/PipelinesCard";
import ServerHealthCard from "./components/dashboard/ServerHealthCard";
import ContainersCard from "./components/dashboard/ContainersCard";
import AlertsCard from "./components/dashboard/AlertsCard";
import DockerLogsCard from "./components/dashboard/DockerLogsCard";
import ProductsPage from "./components/inventory/ProductsPage";
import CategoriesPage from "./components/inventory/CategoriesPage";
import SuppliersPage from "./components/inventory/SuppliersPage";
import MovementsPage from "./components/inventory/MovementsPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("metrics");

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    setUser(null)
  }

  const checkAuth = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/profile`, {
        credentials: 'include'
      })
      if (!res.ok) { setUser(null); return }
      const data = await res.json()
      setUser(data)
    } catch(error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { checkAuth() }, [])
  if (loading) return <div>Loading...</div>
  if (!user) return <LoginCard onLogin={checkAuth} />

  const renderPage = () => {
    switch(activePage) {
      case 'metrics':
        return (
          <div className="flex flex-col gap-4 w-full">
            <DockerLogsCard />
            <div className="flex flex-wrap justify-center gap-5 w-full">
              <PipelinesCard />
              <ServerHealthCard />
              {
                import.meta.env.VITE_NODE_ENV === 'development' && (
                  <ContainersCard />
                )
              }
              {/* <AlertsCard /> */}
            </div>
          </div>
        )
      case 'products':    return <ProductsPage />
      case 'categories':  return <CategoriesPage />
      case 'suppliers':   return <SuppliersPage />
      case 'movements':   return <MovementsPage />
      default:            return null
    }
  }

  return (
    <Layout user={user} handleLogout={handleLogout} onNavigate={setActivePage} activePage={activePage}>
      {renderPage()}
    </Layout>
  )
}