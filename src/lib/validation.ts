import { z } from 'zod';
import { TECHNIQUE_SLUGS } from '@/lib/types';
import type { Brief, BriefErrors, RequiredBriefField } from '@/lib/types';

/** Campos obligatorios de la ETAPA 01, con su longitud minima util. */
export const REQUIRED_BRIEF_FIELDS: readonly RequiredBriefField[] = [
  'topic',
  'offer',
  'audience',
  'tone',
] as const;

const MIN_LENGTH: Record<RequiredBriefField, number> = {
  topic: 4,
  offer: 10,
  audience: 8,
  tone: 6,
};

const LABELS: Record<keyof Brief, string> = {
  topic: 'Tema o Industria',
  offer: 'Producto / Servicio y beneficio',
  audience: 'Publico objetivo',
  tone: 'Tono y direccion visual',
  cta: 'Accion principal',
};

export function briefFieldLabel(field: keyof Brief): string {
  return LABELS[field];
}

/** Validacion en tiempo real de un solo campo (bordes rojos en la UI). */
export function validateBriefField(field: keyof Brief, value: string): string | undefined {
  const clean = value.trim();

  if (field === 'cta') {
    return clean.length > 160 ? 'Maximo 160 caracteres.' : undefined;
  }

  const min = MIN_LENGTH[field];
  if (clean.length === 0) return `${LABELS[field]} es obligatorio.`;
  if (clean.length < min) return `Se necesita algo mas de detalle (minimo ${min} caracteres).`;
  if (clean.length > 600) return 'Maximo 600 caracteres.';
  return undefined;
}

/** Valida el brief completo y devuelve el mapa de errores por campo. */
export function validateBrief(brief: Brief): BriefErrors {
  const errors: BriefErrors = {};
  (Object.keys(brief) as (keyof Brief)[]).forEach((field) => {
    const error = validateBriefField(field, brief[field]);
    if (error) errors[field] = error;
  });
  return errors;
}

export function isBriefComplete(brief: Brief): boolean {
  return Object.keys(validateBrief(brief)).length === 0;
}

/** Progreso 0..1 de los campos obligatorios, para la barra de la ETAPA 01. */
export function briefProgress(brief: Brief): number {
  const done = REQUIRED_BRIEF_FIELDS.filter(
    (field) => validateBriefField(field, brief[field]) === undefined,
  ).length;
  return done / REQUIRED_BRIEF_FIELDS.length;
}

// ---------------------------------------------------------------------------
//  Esquemas de la API (fuente de verdad en el servidor)
// ---------------------------------------------------------------------------

export const pastedCodeSchema = z.object({
  html: z.string().max(400_000).default(''),
  css: z.string().max(200_000).default(''),
  js: z.string().max(200_000).default(''),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del proyecto es obligatorio.').max(120),
  topic: z.string().trim().min(4).max(600),
  offer: z.string().trim().min(10).max(600),
  audience: z.string().trim().min(8).max(600),
  tone: z.string().trim().min(6).max(600),
  cta: z.string().trim().max(160).optional().nullable(),
  // El tope sale de la biblioteca: al anadir una tecnica no hay que tocar esto.
  techniques: z.array(z.enum(TECHNIQUE_SLUGS)).max(TECHNIQUE_SLUGS.length).default([]),
  masterPrompt: z.string().min(1, 'Falta el Prompt Maestro compilado.').max(200_000),
  pastedCode: pastedCodeSchema.nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
