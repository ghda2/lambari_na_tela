import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://wgifmlnbztpdydwfaejm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaWZtbG5ienRwZHlkd2ZhZWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzMwNjIsImV4cCI6MjA3ODU0OTA2Mn0.5JC0yjFxkP0xBCM_iSw9mlrX6xlmNmn59ushoXkVWDQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
