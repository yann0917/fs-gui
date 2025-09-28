import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { api } from '@/services/api'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  loginByPhone: (phone: string, code: string) => Promise<any>
  loginByPassword: (phone: string, password: string) => Promise<any>
  setUser: (userData: { data: User }) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      loginByPhone: async (phone: string, code: string) => {
        const response = await api.loginByPhone(phone, code)
        get().setUser(response.data)
        return response
      },

      loginByPassword: async (phone: string, password: string) => {
        const response = await api.loginByPassword(phone, password)
        get().setUser(response.data)
        return response
      },

      setUser: (userData: { data: User }) => {
        set({
          user: userData.data,
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