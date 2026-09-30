/** Identificadores estables de las tecnicas avanzadas de prompting. */
export const TECHNIQUE_SLUGS = [
  'seed-strings',
  'ambitious-prompts',
  'creator-critic',
  'image-assets',
  'video-assets',
  'subtractive-design',
  'negative-constraints',
  'human-copy',
  'purposeful-motion',
] as const;

export type TechniqueSlug = (typeof TECHNIQUE_SLUGS)[number];

export type TechniqueCategory =
  | 'Direccion de arte'
  | 'Psicologia'
  | 'Calidad'
  | 'Activos'
  | 'Copywriting'
  | 'Interaccion';

export interface Technique {
  readonly slug: TechniqueSlug;
  readonly name: string;
  /** Titular corto mostrado en la tarjeta. */
  readonly tagline: string;
  readonly category: TechniqueCategory;
  /** Nombre del icono de lucide-react usado en la tarjeta. */
  readonly icon:
    | 'Palette'
    | 'Target'
    | 'ShieldCheck'
    | 'Image'
    | 'Video'
    | 'Scissors'
    | 'Ban'
    | 'MessageSquareQuote'
    | 'Sparkles';
  /** Bullets del desplegable "Que hara en tu prompt". */
  readonly whatItDoes: readonly string[];
  /** Bloque de instrucciones que se inyecta en el Prompt Maestro. */
  readonly directive: string;
  /** Objetivo aislado, usado por "Probar tecnicas por separado". */
  readonly soloObjective: string;
  /** Criterios que esta tecnica aporta al checklist de autoevaluacion. */
  readonly checklist: readonly string[];
}

/** ETAPA 01 :: Brief del proyecto. */
export interface Brief {
  topic: string;
  offer: string;
  audience: string;
  tone: string;
  /** Opcional: si viene vacio, el prompt pide a la IA que proponga el CTA. */
  cta: string;
}

export type RequiredBriefField = Exclude<keyof Brief, 'cta'>;

export type BriefErrors = Partial<Record<keyof Brief, string>>;

/** Codigo devuelto por la IA y pegado en el Visor de Codigo. */
export interface PastedCode {
  html: string;
  css: string;
  js: string;
}

export interface IndividualPrompt {
  slug: TechniqueSlug;
  name: string;
  prompt: string;
}

export type CompilationMode = 'master' | 'separate';

export interface ProjectDTO {
  id: string;
  name: string;
  topic: string;
  offer: string;
  audience: string;
  tone: string;
  cta: string | null;
  techniques: TechniqueSlug[];
  masterPrompt: string;
  pastedCode: PastedCode | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: string;
  detail?: string;
  /** true cuando la base de datos no esta disponible (modo solo-prompt). */
  dbUnavailable?: boolean;
}
