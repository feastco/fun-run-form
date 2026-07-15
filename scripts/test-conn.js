const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zbkvujnsqzpjkfaiymvm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia3Z1am5zcXpwamtmYWl5bXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDAzNTgxNCwiZXhwIjoyMDk5NjExODE0fQ.sTlNJzwcUUbjk292iQSfqMTJn4HEOERlFVH3SybbMuw'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function run() {
  console.log('Testing connection...')
  const { data: events, error: eventError } = await supabase.from('events').select('id, name')
  if (eventError) {
    console.error('Error fetching events:', eventError)
  } else {
    console.log('Events in DB:', events)
  }

  console.log('Fetching users...')
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) {
    console.error('Error fetching users:', usersError)
  } else {
    console.log('Users list:', usersData.users.map(u => ({ id: u.id, email: u.email })))
  }
}

run()
