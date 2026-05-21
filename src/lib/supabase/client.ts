'use client'

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uhtangfclaheyvinurwc.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodGFuZ2ZjbGFoZXl2aW51cndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjQ4NDksImV4cCI6MjA5NDk0MDg0OX0.dpmo6puGdcs9Uc7NUD9Wlg_lalp28tuto8eI5hA8hlM'
  
  return createBrowserClient(url, key)
}
