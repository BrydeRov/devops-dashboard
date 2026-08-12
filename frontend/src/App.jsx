import { useState, useEffect, useEffectEvent } from "react";
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
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("metrics");
  const [progress, setProgress] = useState(0);

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
      setTimeout(() => {
        setLoading(false)
      }, 5000)
    }
  }
  useEffect(() => { checkAuth() },[])

  useEffect(() => {
    if (!loading) {
      setProgress(100)
      return
    }

    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        const increment = (90 - prev) * 0.2
        return prev + Math.max(increment, 0.5)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [loading])

  if (loading) return <div className='flex h-screen w-screen justify-center'>
    <Progress value={progress} className="my-auto">
        <ProgressLabel>Loading . . .</ProgressLabel>
        <ProgressValue />
    </Progress>
  </div>
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