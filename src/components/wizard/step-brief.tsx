'use client';

import * as React from 'react';
import { AlertTriangle, ArrowRight, CircleCheck, Eraser, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { briefProgress, validateBrief } from '@/lib/validation';
import type { Brief, BriefErrors } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FieldDefinition {
  name: keyof Brief;
  label: string;
  hint: string;
  placeholder: string;
  multiline: boolean;
  required: boolean;
  maxLength: number;
}

const FIELDS: readonly FieldDefinition[] = [
  {
    name: 'topic',
    label: 'Tema o Industria',
    hint: 'El territorio donde compite la pagina. Cuanto mas concreto, menos generico sale el resultado.',
    placeholder: 'Educacion financiera para jovenes',
    multiline: false,
    required: true,
    maxLength: 600,
  },
  {
    name: 'offer',
    label: 'Producto / Servicio y beneficio principal',
    hint: 'Que vendes y que gana el usuario. Incluye el plazo o la medida si existe.',
    placeholder: 'Curso de finanzas personales para ahorrar en 30 dias',
    multiline: true,
    required: true,
    maxLength: 600,
  },
  {
    name: 'audience',
    label: 'Publico objetivo',
    hint: 'Quien es, en que momento de su vida esta y que ya intento antes.',
    placeholder: 'Jovenes de 20 a 30 anos en su primer empleo',
    multiline: true,
    required: true,
    maxLength: 600,
  },
  {
    name: 'tone',
    label: 'Tono y direccion visual',
    hint: 'Voz + estetica. Nombra colores, referencias o la sensacion buscada.',
    placeholder: 'Minimalista, directo, paleta verde y negro',
    multiline: true,
    required: true,
    maxLength: 600,
  },
  {
    name: 'cta',
    label: 'Accion principal u objetivo de conversion',
    hint: 'Opcional. Si lo dejas vacio, la IA propondra el CTA mas coherente y justificara su eleccion.',
    placeholder: 'Registrarse gratis',
    multiline: false,
    required: false,
    maxLength: 160,
  },
] as const;

/**
 * Briefs de ejemplo de sectores distintos. El boton los va rotando para que
 * puedas ver como cambia el Prompt Maestro segun el tipo de proyecto.
 */
interface ExampleBrief {
  nombre: string;
  brief: Brief;
}

const EXAMPLE_BRIEFS: readonly ExampleBrief[] = [
  {
    nombre: 'Entrenador personal online',
    brief: {
      topic: 'Entrenamiento funcional en casa sin equipo',
      offer:
        'Plan de 12 semanas con rutinas diarias de 30 minutos, seguimiento semanal en videollamada y ajuste de dieta incluido',
      audience:
        'Personas de 28 a 45 anos con trabajo de oficina que no tienen tiempo de ir al gym, quieren resultados reales y ya lo han intentado antes sin exito',
      tone: 'Energico pero sin gritar. Fotografias de personas reales, no fisicos perfectos. Negro, blanco y un amarillo electrico como acento',
      cta: 'Empezar mi plan ahora',
    },
  },
  {
    nombre: 'Inmobiliaria de lujo',
    brief: {
      topic: 'Venta de apartamentos de lujo en Bogota',
      offer:
        'Apartamentos de 2 y 3 habitaciones en el norte de Bogota con terraza privada, vigilancia 24/7 y zonas comunes de hotel cinco estrellas',
      audience:
        'Compradores de 35 a 60 anos con capacidad de credito alta, que buscan una inversion segura y un estilo de vida elevado en una zona consolidada',
      tone: 'Exclusivo, austero y sofisticado. Negro, dorado apagado y crema. Fotografia arquitectonica de gran formato, tipografia serif elegante',
      cta: 'Agendar recorrido privado',
    },
  },
  {
    nombre: 'Psicologa online',
    brief: {
      topic: 'Terapia psicologica en linea para adultos',
      offer:
        'Sesiones de terapia cognitivo-conductual por videollamada, agenda flexible en horario nocturno y primera sesion de valoracion sin costo',
      audience:
        'Adultos de 25 a 40 anos que arrastran ansiedad o bloqueo emocional desde hace meses, quieren hablar con alguien de confianza pero les da pereza (o verguenza) ir a consulta presencial',
      tone: 'Calido, honesto y sin jerga clinica. Tonos tierra, lavanda suave y crema. Nada de imagenes de cerebros ni divanes',
      cta: 'Reservar valoracion gratuita',
    },
  },
  {
    nombre: 'Academia de ingles',
    brief: {
      topic: 'Aprendizaje de ingles para profesionales',
      offer:
        'Metodo conversacional intensivo: una hora diaria durante 6 meses con tutor nativo y garantia de nivel B2 o devolvemos el dinero',
      audience:
        'Profesionales latinoamericanos de 25 a 40 anos que necesitan el ingles para un ascenso, una entrevista o un proyecto internacional y llevan anos postergandolo',
      tone: 'Motivador y practico, sin ambiente universitario. Azul marino, blanco y un coral vivo. Fotografias de personas en entornos de trabajo real',
      cta: 'Probar clase de prueba gratis',
    },
  },
  {
    nombre: 'Agencia de SEO',
    brief: {
      topic: 'Posicionamiento en Google para pequenas empresas',
      offer:
        'Auditoria SEO gratuita en 24 horas y plan de accion con resultados visibles en los primeros 60 dias o no cobramos el segundo mes',
      audience:
        'Duenos de negocios locales con pagina web que no aparecen en Google y ven como sus competidores copan las primeras posiciones sin entender como lo hacen',
      tone: 'Directo, tecnico sin ser intimidante. Verde oscuro y gris carbono. Datos reales y capturas de Google Search Console como prueba social',
      cta: 'Quiero mi auditoria gratis',
    },
  },
  {
    nombre: 'Nutricionista deportivo',
    brief: {
      topic: 'Nutricion deportiva personalizada',
      offer:
        'Plan de alimentacion para atletas amateur: dieta semanal ajustada a tu deporte, tu cuerpo y tu presupuesto, con revision quincenal',
      audience:
        'Corredores, ciclistas y crossfitters de 25 a 45 anos que entrenan 4 o 5 dias a la semana pero sienten que la dieta les frena y no saben que comer antes y despues de entrenar',
      tone: 'Cientifico pero cercano, de deportista a deportista. Verde cesped, negro y blanco puro. Fotografias de comida real, no de suplementos',
      cta: 'Disenar mi plan de nutricion',
    },
  },
  {
    nombre: 'Barberia premium',
    brief: {
      topic: 'Barberia de autor en Ciudad de Mexico',
      offer:
        'Corte y arreglo de barba con tecnica artesanal, productos sin sulfatos y musica en vivo los viernes. Reserva tu silla en menos de 2 minutos',
      audience:
        'Hombres de 22 a 40 anos que cuidan su imagen, odian esperar y quieren un lugar donde el corte sea una experiencia, no un tramite de 15 minutos',
      tone: 'Oscuro, masculino y con caracter. Negro mate, cuero whisky y verde botella. Tipografia bold condensada, fotografia con luz dramatica y grano de pelicula',
      cta: 'Reservar mi silla',
    },
  },
  {
    nombre: 'App de delivery saludable',
    brief: {
      topic: 'Entrega de comida saludable a domicilio',
      offer:
        'Menu semanal de comida fitness cocinada el mismo dia, sin conservantes ni ultraprocesados, entregada en tu puerta antes de las 8 am',
      audience:
        'Profesionales ocupados de 28 a 45 anos que quieren comer sano entre semana pero no tienen tiempo de cocinar y siempre terminan pidiendo comida basura',
      tone: 'Fresco, ligero y apetitoso. Verde lima, blanco y toques de naranja. Fotografia de comida de alta calidad, nada de iconos de ensalada genericos',
      cta: 'Ver el menu de esta semana',
    },
  },
  {
    nombre: 'Fotografa de bodas',
    brief: {
      topic: 'Fotografia de bodas estilo documental en Colombia',
      offer:
        'Cobertura completa del dia: desde el peinado hasta el ultimo baile. Entrega de 500 fotografias editadas en 30 dias y album impreso de tapa dura incluido',
      audience:
        'Parejas de 27 a 38 anos que valoran los momentos espontaneos sobre las fotos posadas, han visto demasiados albums identicos en Pinterest y quieren algo que de verdad los represente',
      tone: 'Romantico y autentico, con mucho espacio en blanco. Tonos film analogico, marfil y sombras suaves. Tipografia delicada, sin cursivas baratas',
      cta: 'Consultar disponibilidad',
    },
  },
  {
    nombre: 'Consultora de Recursos Humanos',
    brief: {
      topic: 'Consultoria de RRHH y seleccion de talento para startups',
      offer:
        'Proceso de seleccion completo en 3 semanas: definicion del perfil, filtro de candidatos y acompanamiento en los primeros 90 dias del nuevo empleado',
      audience:
        'Fundadores y directores de startups de 10 a 50 personas que han quemado tiempo y dinero en malas contrataciones y necesitan un proceso profesional sin montar un departamento interno',
      tone: 'Profesional y estrategico, sin corporativismo. Azul noche, blanco y un verde esmeralda como acento. Datos de retencion y casos de exito como ancla de credibilidad',
      cta: 'Hablar con un consultor',
    },
  },
] as const;

interface StepBriefProps {
  brief: Brief;
  onChange: (field: keyof Brief, value: string) => void;
  onReplaceAll: (brief: Brief) => void;
  onNext: () => void;
}

export function StepBrief({ brief, onChange, onReplaceAll, onNext }: StepBriefProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof Brief, boolean>>>({});
  const [blocked, setBlocked] = React.useState(false);
  const [exampleIndex, setExampleIndex] = React.useState(0);

  /**
   * Siguiente ejemplo a cargar. Si coincide con lo que ya hay escrito (por ejemplo
   * porque quedo del proyecto anterior), salta al siguiente para que la pulsacion
   * siempre cambie algo visible.
   */
  const nextExample = React.useMemo(() => {
    const candidato = EXAMPLE_BRIEFS[exampleIndex % EXAMPLE_BRIEFS.length] ?? EXAMPLE_BRIEFS[0]!;
    if (candidato.brief.topic.trim() !== brief.topic.trim()) return candidato;
    return EXAMPLE_BRIEFS[(exampleIndex + 1) % EXAMPLE_BRIEFS.length] ?? candidato;
  }, [exampleIndex, brief.topic]);

  /** Carga el ejemplo y deja preparado el de la vuelta siguiente. */
  function handleExample() {
    const cargado = nextExample;
    const posicion = EXAMPLE_BRIEFS.findIndex((item) => item.nombre === cargado.nombre);

    onReplaceAll(cargado.brief);
    setTouched({});
    setBlocked(false);
    setExampleIndex((posicion + 1) % EXAMPLE_BRIEFS.length);
    toast.success(`Ejemplo cargado: ${cargado.nombre}`, {
      description: `Pulsa otra vez para pasar a otro de los ${EXAMPLE_BRIEFS.length} sectores.`,
    });
  }

  const errors: BriefErrors = React.useMemo(() => validateBrief(brief), [brief]);
  const progress = briefProgress(brief) * 100;
  const isComplete = Object.keys(errors).length === 0;

  /** Un error se muestra si el campo fue tocado o si el usuario intento avanzar. */
  function visibleError(field: keyof Brief): string | undefined {
    if (!touched[field] && !blocked) return undefined;
    return errors[field];
  }

  function handleAttemptNext() {
    if (!isComplete) {
      setBlocked(true);
      const firstInvalid = FIELDS.find((field) => errors[field.name]);
      if (firstInvalid) {
        const element = document.getElementById(`brief-${firstInvalid.name}`);
        element?.focus();
        element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }
    onNext();
  }

  const missingCount = Object.keys(errors).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="stage-index">Etapa 01</span>
              <CardTitle className="mt-1 text-2xl">Brief del proyecto</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl">
                Estas variables se inyectan literalmente en el Prompt Maestro. La precision aqui es el 80% de
                la calidad final: un brief vago produce una landing generica en cualquier IA.
              </CardDescription>
            </div>
            <Badge variant={isComplete ? 'success' : 'outline'} className="font-mono">
              {isComplete ? 'Brief completo' : `${missingCount} por completar`}
            </Badge>
          </div>
          <div className="space-y-1.5">
            <Progress
              value={progress}
              barClassName={isComplete ? 'bg-success' : undefined}
              aria-label="Progreso del brief"
            />
            <p className="font-mono text-[0.7rem] text-muted-foreground">
              {Math.round(progress)}% de los campos obligatorios validados
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {blocked && !isComplete ? (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>No puedes avanzar todavia</AlertTitle>
              <AlertDescription>
                Faltan {missingCount} {missingCount === 1 ? 'campo obligatorio' : 'campos obligatorios'}. Los
                marcamos en rojo mas abajo.
              </AlertDescription>
            </Alert>
          ) : null}

          {FIELDS.map((field) => {
            const error = visibleError(field.name);
            const value = brief[field.name];
            const isValid = !errors[field.name] && value.trim().length > 0;
            const id = `brief-${field.name}`;

            return (
              <div key={field.name} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor={id} className="flex items-center gap-2">
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    ) : (
                      <Badge variant="outline" className="font-normal">
                        opcional
                      </Badge>
                    )}
                    {isValid ? <CircleCheck className="h-3.5 w-3.5 text-success" aria-hidden /> : null}
                  </Label>
                  <span
                    className={cn(
                      'font-mono text-[0.68rem]',
                      value.length > field.maxLength ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  >
                    {value.length}/{field.maxLength}
                  </span>
                </div>

                {field.multiline ? (
                  <Textarea
                    id={id}
                    value={value}
                    invalid={Boolean(error)}
                    maxLength={field.maxLength}
                    rows={3}
                    placeholder={field.placeholder}
                    aria-describedby={`${id}-hint`}
                    aria-errormessage={error ? `${id}-error` : undefined}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, [field.name]: true }))}
                  />
                ) : (
                  <Input
                    id={id}
                    value={value}
                    invalid={Boolean(error)}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    aria-describedby={`${id}-hint`}
                    aria-errormessage={error ? `${id}-error` : undefined}
                    onChange={(event) => onChange(field.name, event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, [field.name]: true }))}
                  />
                )}

                {error ? (
                  <p id={`${id}-error`} aria-live="polite" className="text-xs font-medium text-destructive">
                    {error}
                  </p>
                ) : (
                  <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                    {field.hint}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExample}>
            <Wand2 />
            Ejemplo: {nextExample.nombre}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onReplaceAll({ topic: '', offer: '', audience: '', tone: '', cta: '' });
              setTouched({});
              setBlocked(false);
            }}
          >
            <Eraser />
            Vaciar
          </Button>
        </div>

        <Button size="lg" onClick={handleAttemptNext} aria-disabled={!isComplete}>
          Elegir tecnicas
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

