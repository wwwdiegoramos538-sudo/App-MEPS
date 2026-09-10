const STORAGE_KEY = 'meps_onboarding_v1';

export function isTutorialDone(userId?: string): boolean {
  if (typeof window === 'undefined' || !userId) return true;
  return localStorage.getItem(`${STORAGE_KEY}_${userId}`) === 'done';
}

export function markTutorialDone(userId: string) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, 'done');
}

export function resetTutorial(userId: string) {
  localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
}

export interface TutorialStep {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  route?: string;
  routeLabel?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: 'sparkles',
    title: 'Bienvenido a MEPS',
    subtitle: 'Traduciendo el Futuro',
    description: 'Esta es tu area de trabajo. Aqui traduces documentos, creas audiolibros y organizas todo tu contenido.',
    bullets: [
      'Usa el menu lateral (PC) o el boton "Mas" (celular) para moverte.',
      'Arriba ves tu plan y cuantas traducciones llevas este mes.',
    ],
  },
  {
    icon: 'dashboard',
    title: 'Dashboard — Inicio',
    subtitle: 'Tu resumen diario',
    description: 'La pagina principal muestra estadisticas y accesos directos.',
    bullets: [
      'Tarjetas: traducciones, documentos, audiolibros y disenos.',
      'Acciones rapidas: botones para ir directo a cada tarea.',
      'Barra de uso: cuanto has consumido de tu plan.',
    ],
    route: '/dashboard',
    routeLabel: 'Ir al Dashboard',
  },
  {
    icon: 'languages',
    title: 'Traducir',
    subtitle: 'El corazon de MEPS',
    description: 'Sube un archivo y obten la traduccion en el idioma que elijas.',
    bullets: [
      'Formatos: PDF, DOCX y TXT.',
      'DOCX conserva colores, fuentes y diseno del original.',
      'Elige idioma origen y destino, luego pulsa "Traducir documento".',
      'Descarga el resultado cuando termine (TXT o DOCX).',
    ],
    route: '/dashboard/translate',
    routeLabel: 'Ir a Traducir',
  },
  {
    icon: 'file',
    title: 'Documentos',
    subtitle: 'Tus archivos subidos',
    description: 'Guarda y administra los archivos que usas para traducir.',
    bullets: [
      'Sube PDF, DOCX o TXT con el boton de carga.',
      'Reutiliza un documento sin volver a subirlo.',
      'Elimina archivos que ya no necesites.',
    ],
    route: '/dashboard/documents',
    routeLabel: 'Ir a Documentos',
  },
  {
    icon: 'history',
    title: 'Historial',
    subtitle: 'Traducciones anteriores',
    description: 'Consulta todo lo que ya tradujiste.',
    bullets: [
      'Ve estado, idiomas y fecha de cada traduccion.',
      'Descarga de nuevo cualquier archivo completado.',
      'Borra entradas del historial si quieres.',
    ],
    route: '/dashboard/history',
    routeLabel: 'Ir al Historial',
  },
  {
    icon: 'library',
    title: 'Biblioteca',
    subtitle: 'Tu contenido organizado',
    description: 'Colecciona traducciones y documentos en un solo lugar.',
    bullets: [
      'Marca favoritos para encontrarlos rapido.',
      'Organiza por categorias.',
    ],
    route: '/dashboard/library',
    routeLabel: 'Ir a Biblioteca',
  },
  {
    icon: 'headphones',
    title: 'Audiolibros',
    subtitle: 'Texto convertido en audio',
    description: 'Genera audiolibros a partir de textos traducidos.',
    bullets: [
      'Pega texto o usa una traduccion existente.',
      'Elige idioma y voz, luego genera el MP3.',
      'Descarga y escucha donde quieras.',
    ],
    route: '/dashboard/audiobooks',
    routeLabel: 'Ir a Audiolibros',
  },
  {
    icon: 'palette',
    title: 'Editor de portadas',
    subtitle: 'Disena como un pro',
    description: 'Crea portadas para libros, revistas o documentos.',
    bullets: [
      'Elige una plantilla (minimal, revista, libro, etc.).',
      'Edita titulo, colores y elementos.',
      'Guarda y descarga tu diseno.',
    ],
    route: '/dashboard/designs',
    routeLabel: 'Ir al Editor',
  },
  {
    icon: 'credit',
    title: 'Suscripcion',
    subtitle: 'Tu plan y limites',
    description: 'Revisa tu plan actual y opciones de mejora.',
    bullets: [
      'Plan Gratis: traducciones limitadas al mes.',
      'Planes superiores: mas traducciones, audiolibros y editor.',
      'Barra del dashboard muestra tu consumo.',
    ],
    route: '/dashboard/subscription',
    routeLabel: 'Ver planes',
  },
  {
    icon: 'message',
    title: 'Soporte',
    subtitle: 'Ayuda cuando la necesites',
    description: 'Chat integrado para resolver dudas sobre MEPS.',
    bullets: [
      'Escribe tu pregunta y recibe respuesta al instante.',
      'Ideal para problemas con archivos o idiomas.',
    ],
    route: '/dashboard/support',
    routeLabel: 'Abrir Soporte',
  },
  {
    icon: 'settings',
    title: 'Configuracion y extras',
    subtitle: 'Personaliza MEPS',
    description: 'Ajustes finales y funciones utiles del menu.',
    bullets: [
      'Configuracion: cambia nombre y contrasena.',
      'Modo oscuro / claro: boton al pie del menu lateral.',
      'Abrir en celular: enlace QR para usar MEPS en el movil.',
      'Cerrar sesion: sale de tu cuenta de forma segura.',
      'Puedes ver este tutorial otra vez desde Configuracion.',
    ],
    route: '/dashboard/settings',
    routeLabel: 'Ir a Configuracion',
  },
];
