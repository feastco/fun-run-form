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

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Connecting to Supabase...')

  // 1. Update event name and description
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .update({
      name: 'Fun Run 2026',
      description: 'Fun Run 2026 - Lari Bersama untuk Indonesia Sehat!'
    })
    .eq('id', 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a')

  if (eventError) {
    console.error('Error updating event:', eventError)
  } else {
    console.log('Event updated successfully.')
  }

  // 2. Update existing 2 categories
  const { error: catError1 } = await supabase
    .from('event_categories')
    .update({
      name: 'OPEN MALE - 5K',
      price: 200000
    })
    .eq('id', 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a')

  const { error: catError2 } = await supabase
    .from('event_categories')
    .update({
      name: 'OPEN MALE - 10K',
      price: 250000
    })
    .eq('id', 'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b')

  if (catError1 || catError2) {
    console.error('Error updating existing categories:', catError1, catError2)
  } else {
    console.log('Existing categories updated successfully.')
  }

  // 3. Upsert other categories
  const otherCategories = [
    {
      id: '55555555-5555-5555-5555-555555555001',
      event_id: 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
      name: 'OPEN FEMALE - 5K',
      distance_km: 5.00,
      price: 200000,
      quota: 500,
      reserved_count: 0,
      is_active: true
    },
    {
      id: '55555555-5555-5555-5555-555555555002',
      event_id: 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
      name: 'MASTER MALE - 5K',
      distance_km: 5.00,
      price: 200000,
      quota: 500,
      reserved_count: 0,
      is_active: true
    },
    {
      id: '55555555-5555-5555-5555-555555555003',
      event_id: 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
      name: 'MASTER FEMALE - 5K',
      distance_km: 5.00,
      price: 200000,
      quota: 500,
      reserved_count: 0,
      is_active: true
    },
    {
      id: '10101010-1010-1010-1010-101010101001',
      event_id: 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
      name: 'OPEN FEMALE - 10K',
      distance_km: 10.00,
      price: 250000,
      quota: 500,
      reserved_count: 0,
      is_active: true
    },
    {
      id: '10101010-1010-1010-1010-101010101002',
      event_id: 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
      name: 'MASTER MALE - 10K',
      distance_km: 10.00,
      price: 250000,
      quota: 500,
      reserved_count: 0,
      is_active: true
    },
    {
      id: '10101010-1010-1010-1010-101010101003',
      event_id: 'a2f1c84b-0144-4866-9dfa-9d90ad5e5c6a',
      name: 'MASTER FEMALE - 10K',
      distance_km: 10.00,
      price: 250000,
      quota: 500,
      reserved_count: 0,
      is_active: true
    }
  ]

  const { error: upsertError } = await supabase
    .from('event_categories')
    .upsert(otherCategories, { onConflict: 'id' })

  if (upsertError) {
    console.error('Error upserting categories:', upsertError)
  } else {
    console.log('Categories upserted successfully.')
  }
}

run()
