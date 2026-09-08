import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Scoped to the caller's own JWT — used only to find out who's asking.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) throw new Error('Not authenticated')

    // Service-role client — bypasses RLS. Only used after the admin check
    // below passes, and only for the two things this function needs to do.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: callerProfile } = await adminClient
      .from('users')
      .select('permission')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.permission !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, full_name, phone, permission } = await req.json()
    if (!email) throw new Error('Missing email')
    const VALID_PERMISSIONS = ['user', 'staff', 'admin']
    const targetPermission = VALID_PERMISSIONS.includes(permission) ? permission : 'user'

    // Creates the auth.users row and emails an invite link for the person to
    // set their own password. handle_new_user (the existing signup trigger)
    // fires on this insert same as a normal signup, auto-creating the
    // public.users row from full_name/phone — always as permission='user'.
    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      { data: { full_name, phone } }
    )
    if (inviteError) throw inviteError

    if (targetPermission !== 'user') {
      const { error: updateError } = await adminClient
        .from('users')
        .update({ permission: targetPermission })
        .eq('id', invited.user.id)
      if (updateError) throw updateError
    }

    return new Response(JSON.stringify({ success: true, userId: invited.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
