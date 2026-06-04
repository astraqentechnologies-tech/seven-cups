import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL

export type UserType = {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  created_at: string
}

type AuthContextType = {
  user: UserType | null
  token: string | null
  profile: UserType | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider ({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('luminary_token')
  )
  const [loading, setLoading] = useState(true)

  // Fetch profiles from Laravel API
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json'
        }
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        localStorage.removeItem('luminary_token')
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to restore user session context:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProfile(token)
    } else {
      setLoading(false)
    }
  }, [token])

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          password_confirmation: password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0]
          throw new Error(data.errors[firstErrorKey][0])
        }
        throw new Error(data.message || 'Registration failed.')
      }

      localStorage.setItem('luminary_token', data.token)
      setUser(data.user)
      setToken(data.token) // Crucial: Set user data first, then trigger token effect change
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      setLoading(false)
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0]
          throw new Error(data.errors[firstErrorKey][0])
        }
        throw new Error(data.message || 'Invalid credentials.')
      }

      localStorage.setItem('luminary_token', data.token)
      setUser(data.user)
      setToken(data.token)
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      setLoading(false)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    setLoading(true)
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }).catch(() => {})
    }
    localStorage.removeItem('luminary_token')
    setUser(null)
    setToken(null)
    setLoading(false)
  }

  const refreshProfile = async () => {
    if (token) await fetchProfile(token)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile: user, // Dynamically tracks state updates instantly now
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        isAdmin: user?.role === 'admin'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
