import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import DashboardMain from './pages/DashboardMain'
import LeadsCRM from './pages/LeadsCRM'
import AISettings from './pages/AISettings'
import WhatsAppInbox from './pages/WhatsAppInbox'
import './index.css'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardMain />} />
          <Route path="leads" element={<LeadsCRM />} />
          <Route path="ai-settings" element={<AISettings />} />
          <Route path="inbox" element={<WhatsAppInbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
