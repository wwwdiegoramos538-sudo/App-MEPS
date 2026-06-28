import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;

  const axiosErr = error as AxiosError<{ error?: string; details?: Array<{ msg?: string; path?: string }> }>;

  if (axiosErr.response?.data?.error) {
    return axiosErr.response.data.error;
  }

  if (axiosErr.response?.data?.details?.length) {
    const first = axiosErr.response.data.details[0];
    if (first?.msg) return first.msg;
  }

  if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message === 'Network Error') {
    const onRender =
      typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');
    if (onRender) {
      return 'El servidor esta despertando (plan gratis). Espera 30-60 segundos e intenta de nuevo.';
    }
    const onPhone =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';
    if (onPhone) {
      return 'No se pudo conectar. Usa la URL del QR (http://IP-de-tu-PC:3000), misma Wi-Fi, y npm run dev en la PC.';
    }
    return 'No se pudo conectar con el servidor. Verifica que npm run dev este corriendo en la PC.';
  }

  if (axiosErr.response?.status === 502 || axiosErr.response?.status === 503 || axiosErr.response?.status === 504) {
    return 'El servidor esta iniciando. Espera un momento e intenta de nuevo.';
  }

  if (axiosErr.response?.status === 429) {
    return 'Demasiadas solicitudes. Espera 1 minuto e intenta de nuevo.';
  }

  if (axiosErr.response?.status === 409) {
    return 'El correo ya esta registrado';
  }

  if (axiosErr.message) {
    return axiosErr.message;
  }

  return fallback;
}
