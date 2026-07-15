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

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Connecting to Supabase to seed admin accounts...')

  const admins = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin.bedasrun@gmail.com',
      password: 'admin123',
      fullName: 'Admin Fun Run'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'rina.koordinator@gmail.com',
      password: 'admin123',
      fullName: 'Rina Koordinator'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'dedi.panitia@gmail.com',
      password: 'admin123',
      fullName: 'Dedi Panitia'
    }
  ]

  for (const admin of admins) {
    console.log(`Checking admin: ${admin.email}...`)
    
    // Attempt to create the user in Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      id: admin.id,
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: { full_name: admin.fullName }
    })

    if (userError) {
      if (userError.message.includes('already exists') || userError.message.includes('already registered')) {
        console.log(`Admin auth user ${admin.email} already exists.`)
      } else {
        console.error(`Error creating auth user ${admin.email}:`, userError)
      }
    } else {
      console.log(`Auth user ${admin.email} created successfully.`)
    }

    // Now upsert to public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: admin.id,
        full_name: admin.fullName,
        role: 'admin'
      }, { onConflict: 'id' })

    if (profileError) {
      console.error(`Error upserting profile for ${admin.email}:`, profileError)
    } else {
      console.log(`Profile for ${admin.email} upserted successfully.`)
    }
  }

  console.log('Seeding finished.')
}

run()
