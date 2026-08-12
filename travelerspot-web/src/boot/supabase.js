import { createClient } from '@supabase/supabase-js'

// ඔයා ලබා දුන් තොරතුරු අනුව සකස් කරන ලදී
const supabaseUrl = 'https://nqpwqokuptdbdpvqozbo.supabase.co'
const supabaseAnonKey = 'sb_publishable_vYazjVm5Gppadrak13wZxA_RkBx1LPW'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default ({ app }) => {
  // සයිට් එකේ ඕනෑම තැනක සිට supabase පාවිච්චි කිරීමට හැකි වන ලෙස සකස් කිරීම
  app.config.globalProperties.$supabase = supabase
}
