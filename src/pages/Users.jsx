import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// On a non-2xx response, invokeError.message is just a generic wrapper —
// the function's actual { error: "..." } body lives in invokeError.context
// (the raw Response) and has to be parsed out separately.
async function extractInvokeError(invokeError) {
  if (invokeError.context?.json) {
    try {
      const body = await invokeError.context.json()
      if (body?.error) return body.error
    } catch {
      // context wasn't JSON — fall through to the generic message
    }
  }
  return invokeError.message
}

const emptyCreateForm = { fullName: '', email: '', phone: '', permission: 'user' }

const inputClass =
  'w-full bg-cinema-darker border border-cinema-border text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-cinema-gold transition-colors'

export default function Users() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [creating, setCreating] = useState(false)
  const [filterPermission, setFilterPermission] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [myPermission, setMyPermission] = useState(null)
  const isSelfAdmin = myPermission === 'admin'

  const filteredUsers = users
    .filter((u) => filterPermission === 'all' || u.permission === filterPermission)
    .filter((u) => {
      const q = searchQuery.trim().toLowerCase()
      if (!q) return true
      return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    })

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, mobile_number, permission')
      .order('created_at', { ascending: false })
    return data || []
  }

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    if (!supabase) { setLoading(false); return }

    let cancelled = false
    loadUsers().then((rows) => {
      if (cancelled) return
      // RLS returns every row for staff/admin, but only the caller's own row
      // otherwise — so this doubles as both the access check and the data.
      const own = rows.find((r) => r.id === user.id)
      if (own?.permission !== 'admin' && own?.permission !== 'staff') {
        navigate('/')
        return
      }
      setMyPermission(own.permission)
      setUsers(rows)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
        body: {
          email: createForm.email,
          full_name: createForm.fullName,
          phone: createForm.phone,
          permission: createForm.permission,
        },
      })
      if (invokeError) throw new Error(await extractInvokeError(invokeError))
      if (data?.error) throw new Error(data.error)

      setUsers(await loadUsers())
      setSuccess(`Invite sent to ${createForm.email}.`)
      setCreateForm(emptyCreateForm)
      setShowCreateForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create user.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (target) => {
    if (!window.confirm(`Delete ${target.full_name || target.email}? This also permanently deletes their bookings. This cannot be undone.`)) {
      return
    }
    setError('')
    setSuccess('')
    setDeletingId(target.id)
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('delete-user', {
        body: { userId: target.id },
      })
      if (invokeError) throw new Error(await extractInvokeError(invokeError))
      if (data?.error) throw new Error(data.error)
      setUsers((prev) => prev.filter((u) => u.id !== target.id))
    } catch (err) {
      setError(err.message || 'Failed to delete user.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleChangePermission = async (target, newPermission) => {
    if (newPermission === target.permission) return
    if (!window.confirm(`Change ${target.full_name || target.email}'s permission to ${newPermission}?`)) {
      return
    }
    setError('')
    setSuccess('')
    setUpdatingId(target.id)
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('update-permission', {
        body: { userId: target.id, permission: newPermission },
      })
      if (invokeError) throw new Error(await extractInvokeError(invokeError))
      if (data?.error) throw new Error(data.error)
      setUsers((prev) => prev.map((u) => u.id === target.id ? { ...u, permission: newPermission } : u))
    } catch (err) {
      setError(err.message || 'Failed to update permission.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-bold">All Users</h1>
        {isSelfAdmin && (
          <button
            onClick={() => { setShowCreateForm(true); setError(''); setSuccess('') }}
            className="bg-cinema-gold hover:bg-cinema-gold-dark text-black text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            + Add User
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-900/40 p-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-400 text-sm mb-4 bg-green-900/20 border border-green-900/40 p-3 rounded-xl">
          {success}
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[220px] bg-cinema-darker border border-cinema-border text-white placeholder-gray-600 px-4 py-2 rounded-xl focus:outline-none focus:border-cinema-gold transition-colors text-sm"
          />
          <div className="flex bg-cinema-darker rounded-xl p-1 w-fit">
            {['all', 'user', 'staff', 'admin'].map((option) => (
              <button
                key={option}
                onClick={() => setFilterPermission(option)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors capitalize ${
                  filterPermission === option
                    ? 'bg-cinema-gold text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-cinema-card border border-cinema-border rounded-2xl overflow-hidden">
        {!supabase ? (
          <p className="text-gray-500 text-sm p-6">Connect Supabase to see users.</p>
        ) : loading ? (
          <p className="text-gray-500 text-sm p-6">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No users found.</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">
            No {filterPermission === 'all' ? '' : `${filterPermission} `}users
            {searchQuery.trim() ? ` match "${searchQuery.trim()}".` : ' found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cinema-border text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Permission</th>
                  {isSelfAdmin && <th className="px-5 py-3 font-medium"></th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-cinema-border last:border-0">
                    <td className="px-5 py-3 text-white">{u.full_name || '—'}</td>
                    <td className="px-5 py-3 text-gray-300">{u.email}</td>
                    <td className="px-5 py-3 text-gray-300">{u.mobile_number || '—'}</td>
                    <td className="px-5 py-3">
                      {isSelfAdmin && u.id !== user.id ? (
                        <select
                          value={u.permission}
                          disabled={updatingId === u.id}
                          onChange={(e) => handleChangePermission(u, e.target.value)}
                          className={`text-xs font-semibold pl-2.5 pr-1 py-1 rounded-full disabled:opacity-50 cursor-pointer capitalize ${
                            u.permission === 'admin'
                              ? 'bg-cinema-gold/15 text-cinema-gold'
                              : u.permission === 'staff'
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-700/60'
                              : 'bg-cinema-darker text-gray-400 border border-cinema-border'
                          }`}
                        >
                          <option value="user">user</option>
                          <option value="staff">staff</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            u.permission === 'admin'
                              ? 'bg-cinema-gold/15 text-cinema-gold'
                              : u.permission === 'staff'
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-700/60'
                              : 'bg-cinema-darker text-gray-400 border border-cinema-border'
                          }`}
                        >
                          {u.permission}
                        </span>
                      )}
                    </td>
                    {isSelfAdmin && (
                      <td className="px-5 py-3 text-right">
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u.id}
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 font-medium transition-colors"
                          >
                            {deletingId === u.id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCreateForm(false)}
        >
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-white text-2xl font-bold mb-1">Add User</h2>
            <p className="text-gray-400 text-sm mb-6">
              Sends an invite email — they'll set their own password.
            </p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={createForm.fullName}
                onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                className={inputClass}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
                required
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={createForm.phone}
                onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
                required
              />
              <select
                value={createForm.permission}
                onChange={(e) => setCreateForm((f) => ({ ...f, permission: e.target.value }))}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={creating}
                className="bg-cinema-gold hover:bg-cinema-gold-dark disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors mt-1"
              >
                {creating ? 'Sending invite…' : 'Send Invite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
