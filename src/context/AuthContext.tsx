import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'

const API_BASE_URL = 'https://admin.sevencups.in/api'
const TOKEN_KEY = 'seven_cups_token'

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
  refreshProfile: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  )
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<Partial<UserType> | null>(null)

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
        // Token invalid — logout
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
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

      // Extended profile (phone, address etc.)
      fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setProfileData({
              phone: data.phone,
              address: data.address ?? data.street_address,
              city: data.city,
              country: data.country
            })
          }
        })
        .catch(err => console.error('Failed to fetch extended profile:', err))
    } else {
      setLoading(false)
    }
  }, [token])

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
    setUser(null)
    setToken(null)
    setProfileData(null)
    setLoading(false)
  }

  const refreshProfile = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        setProfileData({
          phone: data.phone,
          address: data.address ?? data.street_address,
          city: data.city,
          country: data.country
        })
        await fetchProfile(token)
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err)
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