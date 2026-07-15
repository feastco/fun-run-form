const fs = require('fs')
const path = require('path')
const https = require('https')

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim()
  }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const anonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
const serviceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

function request(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const options = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        let parsed = null
        try {
          parsed = data ? JSON.parse(data) : null
        } catch (e) {
          parsed = data
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        })
      })
    })

    req.on('error', (e) => {
      reject(e)
    })

    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function run() {
  const email = 'admin.bedasrun@gmail.com'
  const password = 'admin123'
  const fullName = 'Admin Fun Run'

  console.log('Sending Native signup request to Supabase Auth...')
  let userId = null
  try {
    const signupRes = await request(
      `${supabaseUrl}/auth/v1/signup`,
      'POST',
      { apikey: anonKey },
      {
        email,
        password,
        data: { full_name: fullName }
      }
    )

    console.log('Signup Response:', signupRes.statusCode, signupRes.body)

    if (signupRes.statusCode === 200 || signupRes.statusCode === 201) {
      userId = signupRes.body.id || (signupRes.body.user && signupRes.body.user.id)
      console.log('User signed up successfully. ID:', userId)
    } else {
      console.log('Signup failed or user already exists. Attempting to search for existing user...')
    }

    // List all users to find the ID of admin.bedasrun@gmail.com
    console.log('Listing users via service role key...')
    const listRes = await request(
      `${supabaseUrl}/auth/v1/admin/users`,
      'GET',
      {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    )

    const foundUser = listRes.body && listRes.body.users && listRes.body.users.find(u => u.email === email)
    if (foundUser) {
      userId = foundUser.id
      console.log('Found user ID:', userId)

      console.log('Confirming user email...')
      await request(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        'PUT',
        {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`
        },
        {
          email_confirm: true
        }
      )

      console.log('Upserting user role in profiles table...')
      const profileRes = await request(
        `${supabaseUrl}/rest/v1/profiles`,
        'POST',
        {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: 'resolution=merge-duplicates'
        },
        {
          id: userId,
          full_name: fullName,
          role: 'admin'
        }
      )
      console.log('Profile upsert status:', profileRes.statusCode, profileRes.body)
      console.log('Admin account fully configured!')
    } else {
      console.error('Could not find user in list. Try updating password of existing user or checking Supabase project state.')
    }
  } catch (err) {
    console.error('Error occurred:', err)
  }
}

run()
