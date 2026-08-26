import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'

const API_BASE_URL = 'https://admin.sevencups.in/api'
const TOKEN_KEY = 'seven_cups_token'
const PROFILE_KEY = 'seven_cups_profile' // ← NEW

export type UserType = {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  created_at: string
  phone?: string
  address?: string
  city?: string
  country?: string
}

type AuthContextType = {
  user: UserType | null
  token: string | null
  profile: UserType | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: (updatedData?: Partial<UserType & { street_address?: string }>) => Promise<void>
  loginWithToken: (token: string, userData: UserType) => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  )
  const [loading, setLoading] = useState(true)

  // ← NEW: localStorage se initialize karo
  const [profileData, setProfileData] = useState<Partial<UserType> | null>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

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
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(PROFILE_KEY) // ← NEW
        setToken(null)
        setUser(null)
        setProfileData(null) // ← NEW
      }
    } catch (err) {
      console.error('Failed to restore session:', err)
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

  const loginWithToken = (authToken: string, userData: UserType) => {
    localStorage.setItem(TOKEN_KEY, authToken)
    setToken(authToken)
    setUser(userData)
    setLoading(false)
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
          const firstKey = Object.keys(data.errors)[0]
          throw new Error(data.errors[firstKey][0])
        }
        throw new Error(data.message || 'Registration failed.')
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      setToken(data.token)
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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0]
          throw new Error(data.errors[firstKey][0])
        }
        throw new Error(data.message || 'Invalid credentials.')
      }
      localStorage.setItem(TOKEN_KEY, data.token)
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
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PROFILE_KEY) // ← NEW
    setUser(null)
    setToken(null)
    setProfileData(null)
    setLoading(false)
  }

  const refreshProfile = async (updatedData?: Partial<UserType & { street_address?: string }>) => {
    if (!token || !updatedData) return
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })
      if (res.ok) {
        const newProfile = {
          phone: updatedData.phone,
          address: updatedData.street_address ?? updatedData.address,
          city: updatedData.city,
          country: updatedData.country
        }
        setProfileData(newProfile)
        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile)) // ← NEW
        await fetchProfile(token)
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile: user ? { ...user, ...profileData } : null,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        loginWithToken,
        isAdmin: user?.role === 'admin'
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}