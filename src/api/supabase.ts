import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using local stub for development.')
}

// Provide a minimal stub so the app doesn't crash in dev when env vars are missing.
const makeStub = () => {
  const finalResult = { data: [], error: null }
  const finalResultPromise = Promise.resolve(finalResult)

  const chain: any = {
    select: (..._args: any[]) => chain,
    eq: (..._args: any[]) => chain,
    order: (..._args: any[]) => chain,
    limit: (..._args: any[]) => chain,
    maybeSingle: () => finalResultPromise,
    single: () => finalResultPromise,
    insert: () => finalResultPromise,
    update: () => finalResultPromise,
    delete: () => finalResultPromise,
    then: finalResultPromise.then.bind(finalResultPromise),
    catch: finalResultPromise.catch.bind(finalResultPromise)
  }

  return {
    from: (_: string) => chain,
    rpc: async () => finalResult,
    functions: { invoke: async () => { throw new Error('Supabase functions not configured in this environment') } },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      signIn: async () => ({ data: null, error: null })
    }
  }
}

export const supabase: any = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : makeStub()
