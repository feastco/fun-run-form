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
const serviceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function run() {
  const email = 'admin.bedasrun@gmail.com'
  console.log(`Getting user by email: ${email}...`)
  
  // Note: auth.admin.listUsers can also take filter options, but let's check native API
  // or use direct REST request to find the user
  const https = require('https')
  const u = new URL(supabaseUrl)
  
  const options = {
    hostname: u.hostname,
    port: 443,
    path: '/auth/v1/admin/users?per_page=100',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  }

  const req = https.request(options, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      console.log('List users status:', res.statusCode)
      try {
        const parsed = JSON.parse(data)
        console.log('Total users in list:', parsed.users ? parsed.users.length : 0)
        if (parsed.users) {
          const user = parsed.users.find(u => u.email === email)
          if (user) {
            console.log('FOUND USER BY EMAIL:', user.id, user.email, user.email_confirmed_at)
          } else {
            console.log('User NOT found in list. Users present:', parsed.users.map(u => u.email))
          }
        }
      } catch (e) {
        console.error('Failed to parse:', data)
      }
    })
  })
  req.on('error', (e) => { console.error(e) })
  req.end()
}

run()
