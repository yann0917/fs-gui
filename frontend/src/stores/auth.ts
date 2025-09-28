import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { api } from '@/services/api'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loginByPhone: (phone: string, code: string) => Promise<User>
  loginByPassword: (phone: string, password: string) => Promise<User>
  setUser: (userData: User) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      loginByPhone: async (phone: string, code: string) => {
        const userData = await api.loginByPhone(phone, code)
        get().setUser(userData)
        return userData
      },

      loginByPassword: async (phone: string, password: string) => {
        const userData = await api.loginByPassword(phone, password)
        get().setUser(userData)
        return userData
      },

      setUser: (userData: User) => {
        set({
          user: userData,
          isLoggedIn: true
        })
      },

      logout: async () => {
        try {
          await api.logout()
        } finally {
          set({
            user: null,
            isLoggedIn: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn 
      })
    }
  )
) 