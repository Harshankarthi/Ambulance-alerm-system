import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://abuuiubocotgbyoxjwso.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidXVpdWJvY290Z2J5b3hqd3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTc0MzEsImV4cCI6MjA4OTI5MzQzMX0.g60An4XU1OAMuWyju7eQFfXFD7kW5TOYamxawxFWqjY'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testConnection() {
  console.log('Testing connection to Supabase...')
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('Connection failed! Supabase responded with error:', error.message)
      if (error.message.includes('relation') || error.message.includes('not found')) {
        console.log('HINT: The database exists but the "users" table is missing. Run the SQL schema.')
      }
    } else {
      console.log('Success! Connection established. Database is reachable.')
    }
  } catch (err) {
    console.error('Fatal Error! Could not even reach Supabase:', err.message)
    console.log('HINT: This usually means your internet is off, the URL is blocked, or the Supabase project is Paused/Deleted.')
  }
}

testConnection()
