import { User, Session, AuthResponse } from '@supabase/supabase-js'

export type { User, Session, AuthResponse }

export interface AuthUser extends Omit<User, 'user_metadata'> {
  user_metadata: {
    full_name?: string
    avatar_url?: string
  } & Record<string, unknown>
}

export interface AuthSession extends Omit<Session, 'user'> {
  user: AuthUser
}

export interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  signOut: () => Promise<void>
  loading: boolean
} 