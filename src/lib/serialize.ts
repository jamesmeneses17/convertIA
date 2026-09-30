import type { Project } from '@prisma/client';
import { normalizeTechniques } from '@/lib/techniques';
import type { PastedCode, ProjectDTO } from '@/lib/types';

function toPastedCode(value: unknown): PastedCode | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const html = typeof record.html === 'string' ? record.html : '';
  const css = typeof record.css === 'string' ? record.css : '';
  const js = typeof record.js === 'string' ? record.js : '';
  if (!html && !css && !js) return null;
  return { html, css, js };
}

/** Convierte la fila de Prisma en el DTO tipado que consume el cliente. */
export function serializeProject(project: Project): ProjectDTO {
  return {
    id: project.id,
    name: project.name,
    topic: project.topic,
    offer: project.offer,
    audience: project.audience,
    tone: project.tone,
    cta: project.cta,
    techniques: normalizeTechniques(project.techniques),
    masterPrompt: project.masterPrompt,
    pastedCode: toPastedCode(project.pastedCode),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
