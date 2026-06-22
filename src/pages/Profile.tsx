import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileApi } from '../services/api';
import storageService from '../services/storage';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';
import { 
  UserIcon, 
  DollarSign, 
  Target, 
  Camera, 
  Save, 
  CheckCircle,
  Shield,
  TrendingUp,
  Calendar,
  Award,
  Crown,
  Star,
  Sparkles,
  Verified
} from 'lucide-react';

// Monedas soportadas
const currencies = [
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal Guatemalteco' },
];

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    university: '',
    currency: 'USD',
    monthly_budget: 1000,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtener el rol correctamente desde el perfil o contexto
  const userRole = profile?.role || user?.role || 'user';
  const isAdmin = userRole === 'admin';

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileApi.get();
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        student_id: response.data.student_id || '',
        university: response.data.university || '',
        currency: response.data.currency || 'USD',
        monthly_budget: response.data.monthly_budget || 1000,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      if (isMounted) {
        await loadProfile();
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'monthly_budget' ? parseFloat(value) || 0 : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name) newErrors.full_name = 'El nombre es requerido';
    if (formData.monthly_budget < 0) newErrors.monthly_budget = 'El presupuesto no puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      await profileApi.update(formData);
      await loadProfile();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfile();
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await storageService.uploadAvatar(file, user.id);
      if (avatarUrl) {
        await loadProfile();
      } else {
        alert('Error al subir el avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir el avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerClick = () => {
    if (isEditing) {
      bannerInputRef.current?.click();
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setUploadingBanner(true);
    try {
      const bannerUrl = await storageService.uploadBanner(file, user.id);
      if (bannerUrl) {
        await loadProfile();
      } else {
        alert('Error al subir el banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error al subir el banner');
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    const name = formData.full_name || user?.full_name || user?.email?.split('@')[0] || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.symbol || '$';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Reciente';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Estadísticas de ejemplo (se pueden obtener del backend)
  const stats = {
    total: 0,
    categories: 8,
    thisMonth: 0,
    streak: 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-8"
      style={{ backgroundColor: colors.background }}
    >
      {/* Inputs ocultos para archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Seleccionar avatar"
      />
      <input
        type="file"
        ref={bannerInputRef}
        onChange={handleBannerChange}
        accept="image/*"
        className="hidden"
        aria-label="Seleccionar banner"
      />

      {/* Banner */}
      <div 
        className="relative w-full h-48 md:h-64 overflow-hidden cursor-pointer group"
        onClick={handleBannerClick}
      >
        {profile?.banner_url && !bannerError ? (
          <img
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setBannerError(true)}
          />
        ) : (
          <div 
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#ffffff' }} />
            <div className="absolute bottom-[-30px] left-[-30px] w-28 h-28 rounded-full opacity-10" style={{ backgroundColor: '#ffffff' }} />
          </div>
        )}
        
        {/* Overlay para editar banner */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-2 text-white">
              {uploadingBanner ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Cambiar banner</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar - Solapa sobre el banner */}
      <div className="relative px-4">
        <div className="flex justify-center -mt-16 mb-4">
          <div className="relative group">
            <div 
              className={`w-28 h-28 md:w-32 md:h-32 rounded-full border-4 shadow-xl overflow-hidden cursor-pointer transition-transform duration-300 group-hover:scale-105`}
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                borderColor: colors.surface
              }}
              onClick={handleAvatarClick}
            >
              {uploadingAvatar ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : profile?.avatar_url && !avatarError ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-4xl md:text-5xl text-white font-bold">
                  {getInitials()}
                </span>
              )}
            </div>
            
            {/* Botón de edición de avatar */}
            {isEditing && !uploadingAvatar && (
              <button 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 rounded-full p-1.5 border-2 shadow-lg hover:scale-110 transition-transform"
                style={{ backgroundColor: colors.primary, borderColor: colors.surface }}
                aria-label="Cambiar avatar"
                title="Cambiar avatar"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            
            {/* Badge de administrador en el avatar */}
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1.5 border-2 shadow-lg" style={{ borderColor: colors.surface }}>
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Información del usuario */}
        <div className="text-center mb-6">
          {isEditing ? (
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="text-center text-xl md:text-2xl font-bold bg-transparent border-b focus:outline-none px-2 py-1"
              style={{ color: colors.text, borderColor: colors.primary }}
              placeholder="Tu nombre"
              aria-label="Nombre completo"
            />
          ) : (
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: colors.text }}>
              {formData.full_name || user?.full_name || 'Usuario'}
            </h1>
          )}
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{user?.email}</p>
          <p className="text-xs mt-1" style={{ color: colors.primary }}>
            Miembro desde {formatDate(profile?.created_at)}
          </p>
          
          {/* Badges - Versión mejorada */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {/* Badge de cuenta verificada */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ backgroundColor: `${colors.success}15` }}
            >
              <Verified className="w-3.5 h-3.5" style={{ color: colors.success }} />
              <span className="text-xs font-medium" style={{ color: colors.success }}>Cuenta verificada</span>
            </motion.div>
            
            {/* Badge de administrador - Decorativo */}
            {isAdmin && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 shadow-lg shadow-amber-500/20"
              >
                <div className="relative">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-yellow-400" />
                </div>
                <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Administrador
                </span>
                <Star className="w-2.5 h-2.5 text-amber-500" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Tarjeta de información personal */}
        <div className="rounded-2xl p-6 mb-6 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                <UserIcon className="w-4 h-4" style={{ color: colors.primary }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>Información Personal</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ border: `1px solid ${colors.primary}30`, color: colors.primary }}
                aria-label="Editar perfil"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                  style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                  aria-label="Cancelar edición"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                  style={{ border: `1px solid ${colors.primary}30`, color: colors.primary }}
                  aria-label="Guardar cambios"
                >
                  {saving ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }} /> : <Save className="w-3 h-3" />}
                  Guardar
                </button>
              </div>
            )}
          </div>

          {/* Mensaje de éxito */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: `${colors.success}15`, border: `1px solid ${colors.success}30` }}
              >
                <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
                <span className="text-sm" style={{ color: colors.success }}>Perfil actualizado correctamente</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-3" style={{ backgroundColor: `${colors.background}cc` }}>
              <label className="text-xs mb-1 block" style={{ color: colors.textSecondary }}>Nombre completo</label>
              {isEditing ? (
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm focus:outline-none focus:border-b focus:border-neon-green"
                  style={{ color: colors.text }}
                />
              ) : (
                <p className="text-sm" style={{ color: colors.text }}>{formData.full_name || 'No especificado'}</p>
              )}
              {errors.full_name && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.full_name}</p>}
            </div>

            <div className="rounded-xl p-3" style={{ backgroundColor: `${colors.background}cc` }}>
              <label className="text-xs mb-1 block" style={{ color: colors.textSecondary }}>ID de Estudiante</label>
              {isEditing ? (
                <input
                  id="student_id"
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm focus:outline-none focus:border-b focus:border-neon-green"
                  style={{ color: colors.text }}
                  placeholder="Opcional"
                />
              ) : (
                <p className="text-sm" style={{ color: colors.text }}>{formData.student_id || 'No especificado'}</p>
              )}
            </div>

            <div className="rounded-xl p-3" style={{ backgroundColor: `${colors.background}cc` }}>
              <label className="text-xs mb-1 block" style={{ color: colors.textSecondary }}>Universidad</label>
              {isEditing ? (
                <input
                  id="university"
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm focus:outline-none focus:border-b focus:border-neon-green"
                  style={{ color: colors.text }}
                  placeholder="Opcional"
                />
              ) : (
                <p className="text-sm" style={{ color: colors.text }}>{formData.university || 'No especificada'}</p>
              )}
            </div>

            <div className="rounded-xl p-3" style={{ backgroundColor: `${colors.background}cc` }}>
              <label className="text-xs mb-1 block" style={{ color: colors.textSecondary }}>Moneda</label>
              {isEditing ? (
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm focus:outline-none border-b"
                  style={{ color: colors.text, borderColor: colors.primary }}
                  aria-label="Seleccionar moneda"
                >
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code} style={{ backgroundColor: colors.surface }}>
                      {curr.symbol} - {curr.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm" style={{ color: colors.text }}>{formData.currency}</p>
              )}
            </div>

            <div className="rounded-xl p-3" style={{ backgroundColor: `${colors.background}cc` }}>
              <label className="text-xs mb-1 block" style={{ color: colors.textSecondary }}>Presupuesto mensual</label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: colors.textSecondary }}>
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <input
                    id="monthly_budget"
                    type="number"
                    name="monthly_budget"
                    value={formData.monthly_budget}
                    onChange={handleChange}
                    step="100"
                    className="w-full bg-transparent text-sm focus:outline-none focus:border-b pl-5"
                    style={{ color: colors.text, borderColor: colors.primary }}
                    aria-label="Presupuesto mensual"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {getCurrencySymbol(formData.currency)}{formData.monthly_budget.toLocaleString()}
                </p>
              )}
              {errors.monthly_budget && <p className="text-xs mt-1" style={{ color: colors.error }}>{errors.monthly_budget}</p>}
            </div>

            {/* Campo de Rol - Versión decorativa */}
            <div className="rounded-xl p-3 relative overflow-hidden" style={{ backgroundColor: `${colors.background}cc` }}>
              {/* Efecto de brillo de fondo para admin */}
              {isAdmin && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 70% 30%, ${colors.warning}, transparent 70%)`,
                  }}
                />
              )}
              
              <label className="text-xs mb-1 block flex items-center gap-1" style={{ color: colors.textSecondary }}>
                {isAdmin ? <Crown className="w-3 h-3 text-amber-500" /> : <Shield className="w-3 h-3" />}
                Rol
              </label>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                        Administrador
                      </span>
                      <Sparkles className="w-3 h-3 text-yellow-500" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-3 h-3 text-amber-500" />
                    </motion.div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <span className="text-sm" style={{ color: colors.text }}>Usuario</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de actividad */}
        <div className="rounded-2xl p-6 mb-6 backdrop-blur-sm" style={{ backgroundColor: `${colors.surface}cc`, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
              <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Estadísticas de actividad</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${colors.background}cc` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${colors.primary}20` }}>
                <DollarSign className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>{stats.total}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Gastos totales</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${colors.background}cc` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${colors.warning}20` }}>
                <Target className="w-5 h-5" style={{ color: colors.warning }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>{stats.categories}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Categorías</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${colors.background}cc` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${colors.info}20` }}>
                <Calendar className="w-5 h-5" style={{ color: colors.info }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>{stats.thisMonth}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Gastos este mes</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${colors.background}cc` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${colors.success}20` }}>
                <Award className="w-5 h-5" style={{ color: colors.success }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>{stats.streak}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Racha actual</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;