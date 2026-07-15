const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim()
  }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function run() {
  const email = 'admin.bedasrun@gmail.com'
  const password = 'admin123'
  const fullName = 'Admin Fun Run'

  console.log(`Creating admin user: ${email}...`)

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (userError) {
    console.error('Error creating auth user:', userError)
    return
  }

  const newUserId = userData.user.id
  console.log(`Auth user created successfully with ID: ${newUserId}`)

  // Upsert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: newUserId,
      full_name: fullName,
      role: 'admin'
    })

  if (profileError) {
    console.error('Error upserting profile:', profileError)
  } else {
    console.log('Admin profile upserted successfully!')
  }
}

run()
