import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Helper para obtener URL pública de archivos en Storage
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper para subir archivos
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) {
    console.error("Error uploading file:", error)
    return null
  }

  return getPublicUrl(bucket, data.path)
}

// Helper para eliminar archivos
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return !error
}

export default supabase
