import { useEffect } from 'react'
import { useApp } from './state/AppContext'
import { supabase } from './lib/supabase'
import type { Role } from './types'
import Login from './pages/Login'
import PageRouter from './pages/PageRouter'
import Shell from './components/layout/Shell'
import './styles/global.css'

export default function App() {
  const { state, dispatch } = useApp()

  // Restore Supabase session on page refresh
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          dispatch({ type: 'LOGIN', role: profile.role as Role })
        }
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' })
      }
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          dispatch({ type: 'LOGIN', role: profile.role as Role })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (state.screen === 'login') return <Login />

  return (
    <Shell>
      <PageRouter />
    </Shell>
  )
}
