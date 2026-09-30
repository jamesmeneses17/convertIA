'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Stepper, type StepId } from '@/components/wizard/stepper';
import { StepBrief } from '@/components/wizard/step-brief';
import { StepMethod } from '@/components/wizard/step-method';
import { StepPrompts } from '@/components/wizard/step-prompts';
import { buildIndividualPrompts, buildMasterPrompt } from '@/lib/prompt-builder';
import { EMPTY_CODE } from '@/lib/preview';
import { normalizeTechniques } from '@/lib/techniques';
import { isBriefComplete } from '@/lib/validation';
import { TECHNIQUE_SLUGS } from '@/lib/types';
import type { Brief, CompilationMode, PastedCode, ProjectDTO, TechniqueSlug } from '@/lib/types';

const DRAFT_KEY = 'convertia-draft-v1';

const EMPTY_BRIEF: Brief = { topic: '', offer: '', audience: '', tone: '', cta: '' };

interface Draft {
  step: StepId;
  brief: Brief;
  techniques: TechniqueSlug[];
  mode: CompilationMode;
  pastedCode: PastedCode;
  compiledAt: string | null;
  /** Prompt redactado por la IA, si se pidio. */
  promptIA: string | null;
  savedProjectId: string | null;
  /** Brief con el que se guardo, para saber si ya es otro proyecto. */
  savedSignature: string | null;
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed.brief) return null;
    return {
      step: parsed.step === 2 || parsed.step === 3 ? parsed.step : 1,
      brief: { ...EMPTY_BRIEF, ...parsed.brief },
      techniques: normalizeTechniques(parsed.techniques),
      mode: parsed.mode === 'separate' || parsed.mode === 'ia' ? parsed.mode : 'master',
      pastedCode: { ...EMPTY_CODE, ...(parsed.pastedCode ?? {}) },
      compiledAt: typeof parsed.compiledAt === 'string' ? parsed.compiledAt : null,
      promptIA: typeof parsed.promptIA === 'string' ? parsed.promptIA : null,
      savedProjectId: typeof parsed.savedProjectId === 'string' ? parsed.savedProjectId : null,
      savedSignature: typeof parsed.savedSignature === 'string' ? parsed.savedSignature : null,
    };
  } catch {
    return null;
  }
}

export function WizardShell() {
  const [step, setStep] = React.useState<StepId>(1);
  const [brief, setBrief] = React.useState<Brief>(EMPTY_BRIEF);
  const [techniques, setTechniques] = React.useState<TechniqueSlug[]>([]);
  const [mode, setMode] = React.useState<CompilationMode>('master');
  const [pastedCode, setPastedCode] = React.useState<PastedCode>(EMPTY_CODE);
  const [compiledAt, setCompiledAt] = React.useState<string | null>(null);
  const [promptIA, setPromptIA] = React.useState<string | null>(null);
  const [savedProjectId, setSavedProjectId] = React.useState<string | null>(null);
  const [savedSignature, setSavedSignature] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  /** 1) Rehidrata el borrador local y, si la URL trae ?project=, carga ese proyecto. */
  React.useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setStep(draft.step);
      setBrief(draft.brief);
      setTechniques(draft.techniques);
      setMode(draft.mode);
      setPastedCode(draft.pastedCode);
      setCompiledAt(draft.compiledAt);
      setPromptIA(draft.promptIA);
      setSavedProjectId(draft.savedProjectId);
      setSavedSignature(draft.savedSignature);
    }
    setHydrated(true);

    const projectId = new URLSearchParams(window.location.search).get('project');
    if (!projectId) return;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const payload = (await response.json()) as { project?: ProjectDTO; error?: string };
        if (cancelled) return;
        if (!response.ok || !payload.project) {
          toast.error(payload.error ?? 'No se pudo cargar el proyecto.');
          return;
        }
        loadProject(payload.project);
        window.history.replaceState(null, '', window.location.pathname);
      } catch {
        if (!cancelled) toast.error('No se pudo contactar con el servidor.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /** 2) Persiste el borrador en cada cambio relevante. */
  React.useEffect(() => {
    if (!hydrated) return;
    const draft: Draft = {
      step,
      brief,
      techniques,
      mode,
      pastedCode,
      compiledAt,
      promptIA,
      savedProjectId,
      savedSignature,
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* cuota o modo privado: el borrador solo vive en memoria */
    }
  }, [
    hydrated,
    step,
    brief,
    techniques,
    mode,
    pastedCode,
    compiledAt,
    promptIA,
    savedProjectId,
    savedSignature,
  ]);

  /** Identifica el proyecto por su brief: si cambia, ya es otro proyecto. */
  const firmaBrief = `${brief.topic.trim()}|${brief.offer.trim()}`;

  /**
   * Al cambiar el brief dejamos de apuntar al proyecto guardado, para que el
   * siguiente guardado cree uno nuevo en vez de machacar el anterior.
   */
  React.useEffect(() => {
    if (!hydrated || !savedProjectId || !savedSignature) return;
    if (savedSignature !== firmaBrief) {
      setSavedProjectId(null);
      setSavedSignature(null);
    }
  }, [hydrated, savedProjectId, savedSignature, firmaBrief]);

  const compiledDate = React.useMemo(
    () => (compiledAt ? new Date(compiledAt) : undefined),
    [compiledAt],
  );

  const masterPrompt = React.useMemo(
    () => buildMasterPrompt(brief, techniques, { compiledAt: compiledDate }),
    [brief, techniques, compiledDate],
  );

  const individualPrompts = React.useMemo(
    () => buildIndividualPrompts(brief, techniques, { compiledAt: compiledDate }),
    [brief, techniques, compiledDate],
  );

  /** Nombre corto para bautizar encargos y archivos. */
  const nombreProyecto = React.useMemo(() => {
    const base = brief.offer.trim() || brief.topic.trim() || 'Proyecto sin titulo';
    return base.length > 70 ? `${base.slice(0, 67)}...` : base;
  }, [brief.offer, brief.topic]);

  const briefComplete = isBriefComplete(brief);
  const unlocked: Record<StepId, boolean> = {
    1: true,
    2: briefComplete,
    3: briefComplete && compiledAt !== null,
  };

  function loadProject(project: ProjectDTO) {
    setBrief({
      topic: project.topic,
      offer: project.offer,
      audience: project.audience,
      tone: project.tone,
      cta: project.cta ?? '',
    });
    setTechniques(project.techniques);
    setPastedCode(project.pastedCode ?? EMPTY_CODE);
    setMode('master');
    setCompiledAt(new Date().toISOString());
    setSavedProjectId(project.id);
    setSavedSignature(`${project.topic.trim()}|${project.offer.trim()}`);
    setStep(3);
    toast.success('Proyecto cargado', { description: `"${project.name}" listo para recompilar.` });
  }

  /** La IA devolvio el Prompt Maestro: lo guardamos y pasamos a la Etapa 03. */
  function handlePromptListo(texto: string, notas: string | null) {
    setPromptIA(texto);
    setMode('ia');
    setCompiledAt(new Date().toISOString());
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Prompt Maestro redactado por la IA', {
      description: notas ?? `${texto.length.toLocaleString('es-CO')} caracteres, escrito para este brief.`,
    });
  }

  function handleBriefChange(field: keyof Brief, value: string) {
    setBrief((prev) => ({ ...prev, [field]: value }));
  }

  function handleToggleTechnique(slug: TechniqueSlug, active: boolean) {
    setTechniques((prev) =>
      normalizeTechniques(active ? [...prev, slug] : prev.filter((item) => item !== slug)),
    );
  }

  function handleCompile(nextMode: CompilationMode) {
    if (nextMode === 'ia') return;
    if (!briefComplete) {
      setStep(1);
      toast.error('Completa el brief antes de compilar.');
      return;
    }
    setMode(nextMode);
    setCompiledAt(new Date().toISOString());
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(
      nextMode === 'master'
        ? 'Prompt Maestro compilado'
        : `${techniques.length} ${techniques.length === 1 ? 'prompt' : 'prompts'} independientes generados`,
    );
  }

  function handleNavigate(next: StepId) {
    if (!unlocked[next]) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-8">
      <Stepper current={step} unlocked={unlocked} onNavigate={handleNavigate} />

      {step === 1 ? (
        <StepBrief
          brief={brief}
          onChange={handleBriefChange}
          onReplaceAll={(next) => setBrief(next)}
          onNext={() => handleNavigate(2)}
        />
      ) : null}

      {step === 2 ? (
        <StepMethod
          brief={brief}
          projectName={nombreProyecto}
          onPromptListo={handlePromptListo}
          selected={techniques}
          onToggle={handleToggleTechnique}
          onSelectAll={() => setTechniques([...TECHNIQUE_SLUGS])}
          onClearAll={() => setTechniques([])}
          onCompile={handleCompile}
          onBack={() => handleNavigate(1)}
        />
      ) : null}

      {step === 3 ? (
        <StepPrompts
          brief={brief}
          techniques={techniques}
          mode={mode}
          masterPrompt={masterPrompt}
          promptIA={promptIA}
          individualPrompts={individualPrompts}
          pastedCode={pastedCode}
          savedProjectId={savedProjectId}
          onPastedCodeChange={setPastedCode}
          onModeChange={(next) => {
            if (next === 'separate' && techniques.length === 0) return;
            if (next === 'ia' && !promptIA) return;
            setMode(next);
          }}
          onBack={() => handleNavigate(2)}
          onSaved={(project) => {
            setSavedProjectId(project.id);
            setSavedSignature(firmaBrief);
          }}
        />
      ) : null}
    </div>
  );
}
