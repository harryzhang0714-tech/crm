import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enbcqryaccftjvlqwahe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYmNxcnlhY2NmdGp2bHF3YWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDM2NDAsImV4cCI6MjA5NDE3OTY0MH0.EW6VVVeacas2o6UlbAmJYjOTvOLHaTO3NtCmB89q3oQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const TABLES = {
  MEMBERS: 'members',
  CUSTOMERS: 'customers',
  DEALS: 'deals',
  TASKS: 'tasks',
  REMINDERS: 'reminders',
  DAILY_TODOS: 'daily_todos',
};