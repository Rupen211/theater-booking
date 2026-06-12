import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured. Add your credentials to .env')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase is not configured. Add your credentials to .env')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  const updateProfile = async ({ full_name, phone, address }) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name, phone, address },
    })
    if (error) throw error
    setUser(data.user)
  }

  const updateEmail = async (newEmail) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile, updateEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
