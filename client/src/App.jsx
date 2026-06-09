import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Layout from './Pages/Layout'
import Dashboard from './Pages/Dashboard'
import ResumerBuilder from './Pages/ResumerBuilder'
import Preview from './Pages/Preview'
import { useDispatch } from 'react-redux'
import api from './configs/api'
import { login, setLoading } from './app/features/authSlice'
import { Toaster } from 'react-hot-toast'
import ATSChecker from './Pages/ATSChecker'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const getUserData = async () => {
      const token = localStorage.getItem('token')
      try {
        if (token) {
          // ensure requests include Bearer token
          api.defaults.headers.common.Authorization = `Bearer ${token}`
          const { data } = await api.get('/api/users/data')
          if (data.user) {
            dispatch(login({ token, user: data.user }))
          }
        }
      } catch (err) {
        console.log(err.message)
      } finally {
        dispatch(setLoading(false))
      }
    }

    getUserData()
  }, [])

  return (
    <>
      {/* ✅ ALWAYS OUTSIDE Routes */}
      <Toaster position="top-right" />

      {/* ✅ Routes contains ONLY Route */}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="builder/:resumeId" element={<ResumerBuilder />} />
        </Route>

        <Route path="/view/:resumeId" element={<Preview />} />
        <Route path="/ats-checker" element={<ATSChecker />} />
      </Routes>
    </>
  )
}

export default App
 