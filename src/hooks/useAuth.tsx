"use client"

import { createContext, useContext, useState } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: null
  login: () => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated] = useState(true)
  const [loading] = useState(false)

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user: null, login: () => true, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return context
}