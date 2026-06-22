import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Usar SERVICE KEY (bypass total de RLS)
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbG1idWZxZWRteXlsdWd0dHFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYwNDk2OCwiZXhwIjoyMDk2MTgwOTY4fQ.No0WRHrMFvNAHi88sKJXFL8ckrpU9Tr4qK3JxYp_eto";

console.log('🔧 Inicializando Supabase con Service Key...');
console.log('📡 URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '');

const storageService = {
  uploadAvatar: async (file: File, userId: string): Promise<string | null> => {
    try {
      console.log('📤 Subiendo avatar para usuario:', userId);
      console.log('📄 Nombre del archivo:', file.name);
      console.log('📦 Tamaño:', (file.size / 1024).toFixed(2), 'KB');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
      
      console.log('💾 Subiendo como:', fileName);

      // Subir a Supabase Storage
      const { error, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('❌ Error detallado:', error);
        throw error;
      }

      console.log('✅ Archivo subido:', data);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('✅ URL pública:', publicUrl);

      // Actualizar perfil del usuario
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError);
        return null;
      }

      console.log('✅ Avatar actualizado correctamente');
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      return null;
    }
  },

  uploadBanner: async (file: File, userId: string): Promise<string | null> => {
    try {
      console.log('📤 Subiendo banner para usuario:', userId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${userId}_${Date.now()}.${fileExt}`;

      const { error, data } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('❌ Error detallado:', error);
        throw error;
      }

      console.log('✅ Archivo subido:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      console.log('✅ URL pública:', publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError);
        return null;
      }

      console.log('✅ Banner actualizado correctamente');
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading banner:', error);
      return null;
    }
  },
};

export default storageService;