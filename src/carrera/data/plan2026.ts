// Plan de Estudios 2026 de Medicina Veterinaria (FCV-UNR), tomado del documento oficial de la carpeta
// "Plan de estudios 2026" que comparte Unidad Veterinaria en Google Drive (PLAN_2026_DRIVE).
// Incluye: materias con carga horaria y contenidos mínimos, correlatividades para rendir, orientaciones,
// matriz de equivalencias con el Plan 2009 y el plan de transición. Datos fijos: si la facultad cambia el
// documento hay que actualizarlos a mano. Archivo generado a partir del PDF y revisado a mano.

export const PLAN_2026_DRIVE = 'https://drive.google.com/drive/folders/1w1-QcetjUTCnqV5UElRPTjrreRyUju7W';

export type Cursado = '1c' | '2c' | 'anual';

export interface Materia2026 {
  code: string;
  nombre: string;
  anio: number;
  cursado: Cursado;
  horas: number;
  contenidos: string;
  /** Correlativas para rendir: regulares y aprobadas (códigos del Plan 2026) */
  regulares: string[];
  aprobadas: string[];
}

/** Carga horaria total, duración y distribución de cada sub orientación (500 hs) */
export const RESUMEN_2026 = {
  horas: 4000,
  duracion: '5 años y medio',
  titulo: 'Médica/o Veterinaria/o',
  tituloIntermedio: 'Bachiller Universitario (1.500 hs)',
  orientacion: { total: 500, pps: 200, obligatorias: 90, optativas: 120, tesina: 90 },
} as const;

export const MATERIAS_2026: Materia2026[] = [
  { code: '1.1.1', nombre: 'Física Biológica', anio: 1, cursado: '1c', horas: 100, regulares: [], aprobadas: [],
    contenidos: 'Biomecánica. Biorreología. Termodinámica de los seres vivos. Interacciones electromagnéticas. Sistemas dispersos. Biofísica de las membranas y de las macromoléculas. Electrobiología. Bioacústica. Radiaciones electromagnéticas. Bioóptica.' },
  { code: '1.2.1', nombre: 'Química Biológica', anio: 1, cursado: '1c', horas: 120, regulares: [], aprobadas: [],
    contenidos: 'Compuestos inorgánicos y biomoléculas. Bioenergética. Rutas metabólicas. Bioquímica de los procesos orgánicos.' },
  { code: '1.3.1', nombre: 'Biología y Ecología', anio: 1, cursado: '1c', horas: 60, regulares: [], aprobadas: [],
    contenidos: 'Niveles de organización de la materia. Evolución y diversidad biológica. Ecología. Ecosistemas pecuarios. Recursos naturales y su conservación. Desarrollo sostenible.' },
  { code: '1.4.2', nombre: 'Introducción a la Anatomía', anio: 1, cursado: '2c', horas: 70, regulares: [], aprobadas: [],
    contenidos: 'Generalidades de la Anatomía, conceptos, regiones corporales. Desarrollo embrionario de distintos sistemas y aparatos. Nomenclatura anatómica, planos y cortes. Generalidades del aparato osteoartromiológico. Conformación del esqueleto axial y cavidades torácica, abdominal y pélvica. Estructura de vísceras y órganos, conformación del sistema nervioso, circulatorio, digestivo, respiratorio, urinario, genital y endócrino.' },
  { code: '1.5.2', nombre: 'Biología Celular, Tisular y del Desarrollo', anio: 1, cursado: '2c', horas: 75, regulares: ["1.1.1"], aprobadas: ["1.2.1", "1.3.1"],
    contenidos: 'Morfología y función celular. Microscopía y técnica histológica. Fecundación y organización embrionaria. Tejidos corporales e histogénesis.' },
  { code: '1.6.2', nombre: 'Inglés', anio: 1, cursado: '2c', horas: 90, regulares: [], aprobadas: [],
    contenidos: 'Lectocomprensión de textos académicos en inglés del campo de la medicina veterinaria. Estrategias de lectura (skimming, scanning, inferencia). Terminología específica y formación de palabras. Estructuras gramaticales: oraciones simples y complejas, tiempos verbales, modales, voz pasiva y condicionales. Cohesión y coherencia textual: conectores y organización discursiva. Análisis lingüístico aplicado a textos científicos. Integración con contenidos disciplinares: Bienestar Animal, Bioseguridad, One Health y Desarrollo Sostenible.' },
  { code: '1.7.2', nombre: 'Medicina Veterinaria y Sociedad', anio: 1, cursado: '2c', horas: 45, regulares: [], aprobadas: [],
    contenidos: 'La medicina veterinaria como práctica profesional: paradigmas y ámbitos de desempeño en relación con la sociedad. Construcción de la identidad profesional: introducción a los enfoques Una Salud, Bienestar Animal, Bioseguridad y Desarrollo Sostenible; dimensión política del ejercicio profesional. Cuidado y ejercicio profesional. Problemáticas contemporáneas de la profesión: conflictos éticos, sociales y económicos del ejercicio profesional, trabajo interdisciplinario y herramientas comunicacionales para el abordaje dialógico.' },
  { code: '2.8.1', nombre: 'Anatomía I', anio: 2, cursado: '1c', horas: 90, regulares: [], aprobadas: ["1.4.2"],
    contenidos: 'Estudio descriptivo y comparativo del aparato locomotor de miembros, tronco, cabeza y cuello en especies de interés veterinario. Esqueleto y sus articulaciones. Sistemas neuromusculares y anexos. Riego arterial, venoso y drenaje linfático.' },
  { code: '2.9', nombre: 'Histofisiología', anio: 2, cursado: 'anual', horas: 240, regulares: [], aprobadas: ["1.1.1", "1.4.2", "1.5.2"],
    contenidos: 'Histofisiología de los aparatos y sistemas. Medio interno. Homeostasis. Mecanismos de regulación y control del organismo ante variaciones del medio interno y ambiente. Integración histofisiológica del organismo.' },
  { code: '2.10.1', nombre: 'Sociología', anio: 2, cursado: '1c', horas: 45, regulares: [], aprobadas: ["1.7.2"],
    contenidos: 'Introducción a la Sociología. Sociología Rural y Urbana. Actor Social. Otros paradigmas en el estudio de la salud animal. Ambiente y cambio climático desde una perspectiva sociológica. Extensión universitaria y compromiso social. Prácticas Sociales Educativas.' },
  { code: '2.11.2', nombre: 'Anatomía II', anio: 2, cursado: '2c', horas: 90, regulares: ["1.5.2"], aprobadas: ["2.8.1"],
    contenidos: 'Estudio descriptivo y topográfico de la anatomía macroscópica de los órganos y vísceras que constituyen los componentes cefálicos, cérvico torácicos y abdominopélvicos de equinos, bovinos, ovinos, caprinos, suinos, cánidos, felinos, conejos y aves. Órganos y vísceras del neurocráneo y sistemas digestivo, respiratorio, urinario, genital y circulatorio.' },
  { code: '2.12.2', nombre: 'Economía', anio: 2, cursado: '2c', horas: 60, regulares: [], aprobadas: ["2.10.1"],
    contenidos: 'Economía: conceptos básicos. Microeconomía. Macroeconomía. Economía agraria. Sistemas económicos. Mix de Marketing. Empresa Agropecuaria y Veterinaria. Costos. Planeamiento y control de la Empresa Agropecuaria y Veterinaria. Gerenciamiento. Análisis de la empresa Agropecuaria y veterinaria. Rentabilidad. Diseño y Evaluación de Proyectos Agropecuarios y del negocio veterinario.' },
  { code: '2.13.2', nombre: 'Microbiología', anio: 2, cursado: '2c', horas: 90, regulares: [], aprobadas: ["1.4.2", "1.5.2"],
    contenidos: 'Ciencias Microbiológicas: generalidades, relación con otras disciplinas e inserción en la Carrera de Medicina Veterinaria. Bacteriología y Micología: taxonomía, morfología, estructura, fisiología, metabolismo, genética, reproducción, diagnóstico de laboratorio y enfermedades asociadas. Virología: virus y priones; estructura, composición química, sensibilidad a agentes físicos y químicos, taxonomía, especies de interés veterinario, enfermedades asociadas y diagnóstico.' },
  { code: '3.14.1', nombre: 'Inmunología', anio: 3, cursado: '1c', horas: 90, regulares: [], aprobadas: ["2.9", "2.13.2"],
    contenidos: 'Sistema inmunológico: órganos, tejidos, células y factores solubles que lo componen. Bases y componentes de la respuesta inmune. Inmunidad frente a microorganismos: resistencia a los organismos y mecanismos de evasión a la respuesta inmune. Reacciones que implican daño inmunológico a células, tejidos y órganos. Hipersensibilidad. Inmunodeficiencia y autoinmunidad. Inmunidad pasiva natural y artificial. Inmunización pasiva: suero hiperinmune como herramienta terapéutica. Inmunidad activa natural y artificial. Introducción a la Inmunoprofilaxis: vacunas. Pruebas inmunodiagnosticas: fundamentos, técnicas e interpretación de resultados.' },
  { code: '3.15', nombre: 'Farmacología y Toxicología', anio: 3, cursado: 'anual', horas: 130, regulares: ["3.18"], aprobadas: ["2.9", "2.13.2"],
    contenidos: 'Farmacodinamia. Farmacocinética. Quimioterapia antimicrobiana. Una Salud. Farmacología de la inflamación y el dolor. Anestésicos. Farmacología del crecimiento y desarrollo. Antineoplásicos. Farmacología orientada a los diferentes sistemas orgánicos. Toxicología. Farmacología clínica.' },
  { code: '3.16.1', nombre: 'Nutrición Animal', anio: 3, cursado: '1c', horas: 60, regulares: [], aprobadas: ["2.9"],
    contenidos: 'Nutrientes. Composición químico-biológica de los alimentos. Análisis y clasificación de los alimentos. Métodos de evaluación. Conceptos de nutrición animal. Regulación del consumo. Requerimientos nutricionales en las distintas especies. Tablas de requerimientos. Cálculos de raciones. Procesado y preparación de alimentos.' },
  { code: '3.17', nombre: 'Patología', anio: 3, cursado: 'anual', horas: 190, regulares: [], aprobadas: ["2.11.2", "3.14.1"],
    contenidos: 'Patología celular y de los tejidos. Trastornos hemodinámicos y de otros fluidos corporales. Inflamación y reparación de los tejidos. Agentes etiológicos y patogenia de las enfermedades. Trastornos del crecimiento celular, tisular y orgánico. Patología de los aparatos o sistemas orgánicos. Exámenes ante y post mortem. Cambios post mortem. Toma y remisión de muestras.' },
  { code: '3.18', nombre: 'Parasitología y Enfermedades Parasitarias', anio: 3, cursado: 'anual', horas: 140, regulares: ["3.15"], aprobadas: ["2.9", "2.11.2"],
    contenidos: 'Conceptos generales de parasitología veterinaria. Morfología, taxonomía, ciclos biológicos, mecanismos de transmisión, relación parásito-hospedador y acciones patógenas de los principales protozoarios, helmintos y artrópodos de importancia veterinaria y zoonótica. Enfermedades parasitarias que afectan a los animales domésticos, fauna autóctona y/o exótica. Aspectos epidemiológicos, clínicos, diagnósticos, terapéuticos y profilácticos de las parasitosis de mayor importancia sanitaria, productiva y zoonótica. Bioseguridad aplicada al diagnóstico y prevención de enfermedades parasitarias.' },
  { code: '3.19.2', nombre: 'Introducción a los sistemas de producción', anio: 3, cursado: '2c', horas: 60, regulares: ["3.16.1"], aprobadas: ["1.3.1", "1.4.2"],
    contenidos: 'Sistemas de producción animal: Conceptualización desde los ejes transversales. Tipos de sistemas: Tradicional/Indígena, Agroecológico y Convencional/Productivista. Escala Industrial- Familiar/Campesina. Características e impacto del medio ambiente en la eficiencia de los sistemas mediante una introducción a la climatología, edafología y geografía. Interacciones en la tríada ambiente-animal-vegetal. Instalaciones ganaderas. Fisiología vegetal. Especies forrajeras. Plantas tóxicas. Sistemas de pastoreo. Domesticación. Adaptaciones. Clasificación y valoración zootécnica. Crecimiento, desarrollo. Características generales de las distintas especies de producción animal. Biotipos productivos. Producciones no tradicionales.' },
  { code: '3.20.2', nombre: 'Bioestadística', anio: 3, cursado: '2c', horas: 60, regulares: [], aprobadas: ["1.3.1"],
    contenidos: 'Estadística descriptiva: variables, organización de datos y medidas de resumen. Fundamentos de probabilidad y modelos de distribución (binomial y normal). Muestreo y estimación de parámetros para medias y proporciones. Estadística inferencial: test de hipótesis, análisis de variables categóricas (Chi-cuadrado), diseño experimental (ANOVA) y modelos asociados (regresión y correlación).' },
  { code: '4.21.1', nombre: 'Enfermedades Infecciosas', anio: 4, cursado: '1c', horas: 100, regulares: ["3.15"], aprobadas: ["3.17"],
    contenidos: 'Enfermedades infecciosas que afectan a los animales domésticos: etiología, epidemiología, patogenia, signos clínicos, diagnóstico, tratamiento y prevención.' },
  { code: '4.22', nombre: 'Semiología y Análisis Clínicos', anio: 4, cursado: 'anual', horas: 150, regulares: ["3.17"], aprobadas: ["2.9", "2.11.2", "3.19.2"],
    contenidos: 'Semiología y propedéutica: conceptos generales. Examen clínico con abordaje individual y poblacional. Métodos de aproximación, sujeción en las distintas especies. Examen físico de los diferentes sistemas y aparatos. Exámenes complementarios. Análisis Clínicos: exámenes bioquímicos para el estudio de los diferentes sistemas y aparatos. Hematología. Bioquímica sanguínea. Enzimología clínica. Líquidos de punción. Examen físico químico de orina y materia fecal. Imagenología.' },
  { code: '4.23', nombre: 'Epidemiología y Salud Pública', anio: 4, cursado: 'anual', horas: 125, regulares: ["4.21.1"], aprobadas: ["2.10.1", "3.14.1", "3.18", "3.20.2"],
    contenidos: 'Epidemiología tradicional y crítica. Método epidemiológico descriptivo, analítico y experimental. Prevención, control y erradicación de riesgos sanitarios en la interfaz humano- animal-ambiente. Vigilancia. Gestión de la información. Zoonosis y enfermedades no transmisibles. Enfermedades transmitidas por alimentos. Problemática ambiental. Impacto. Saneamiento. Control de plagas, vectores y reservorios. Modelos de salud. Educación para la salud. Administración sanitaria. Políticas públicas y legislación en salud pública. Dirección y certificación.' },
  { code: '4.24', nombre: 'Cirugía', anio: 4, cursado: 'anual', horas: 140, regulares: ["4.22"], aprobadas: ["2.11.2", "3.15"],
    contenidos: 'Introducción a la Anestesiología. Preparación del paciente. Tipos de anestesia. Algiología. Monitoreo. Introducción a la cirugía. Instrumental quirúrgico. Técnica aséptica y técnica atraumática. Abordajes y técnicas quirúrgicas en los distintos sistemas y aparatos.' },
  { code: '4.25.1', nombre: 'Medicina, Manejo y Conservación de Fauna Silvestre', anio: 4, cursado: '1c', horas: 60, regulares: [], aprobadas: ["3.14.1", "3.15", "3.17", "3.18"],
    contenidos: 'Principios ecológicos, etológicos y médico-sanitarios aplicados al manejo, rehabilitación y conservación de fauna silvestre. Conservación de especies autóctonas. Problemáticas derivadas del tráfico ilegal y las especies exóticas. Aspectos biológicos y sanitarios de anfibios, reptiles, aves y mamíferos silvestres. Rol veterinario en conservación y bienestar animal.' },
  { code: '4.26.1', nombre: 'Ética, Política y Legislación Veterinaria', anio: 4, cursado: '1c', horas: 30, regulares: ["3.15", "3.17"], aprobadas: ["2.10.1"],
    contenidos: 'Elementos de las principales teorías éticas: ética de la virtud, deontología, utilitarismo. Moral profesional. Requisitos legales para el ejercicio profesional. Zooterápicos. Fitoterápicos. Medicina legal veterinaria. Pericia médico legal y dictamen pericial. Eutanasia. Las lesiones desde el punto de vista legal. Legislación que involucra la actividad agropecuaria. Contratos. Seguros: Abigeato. Sanidad Animal y Salud Pública. Normativas. Protección animal. Doping. Intervención veterinaria en la utilización de animales en eventos públicos.' },
  { code: '4.27.2', nombre: 'Genética', anio: 4, cursado: '2c', horas: 90, regulares: [], aprobadas: ["1.5.2", "3.20.2"],
    contenidos: 'Cromosomas. Herencia mendeliana y edición génica. Genética de las poblaciones. Selección y mejoramiento animal.' },
  { code: '4.28.2', nombre: 'Sistemas de Producción I', anio: 4, cursado: '2c', horas: 60, regulares: ["4.27.2"], aprobadas: ["3.16.1", "3.17", "3.18", "3.19.2", "4.21.1"],
    contenidos: 'Producción de Aves. Introducción. Anatomía y Fisiología. Instalaciones avícolas. Implementos. Reproductores pesados, livianos y semipesados. Incubación. Pollos parrilleros. Ponedoras de huevo de consumo. Alimentación. Enfermedades. Plan de vacunación. Bienestar. Bioseguridad. Producción de Porcinos. Razas. Selección. Caracteres de productividad. Reproducción. Servicios. Gestación. Parto. Cría. Desarrollo. Terminación. Alimentación. Instalaciones. Sanidad. Gerenciamiento y comercialización. Bienestar. Bioseguridad.' },
  { code: '5.29', nombre: 'Clínica Médica y Quirúrgica de Animales de Compañía', anio: 5, cursado: 'anual', horas: 255, regulares: [], aprobadas: ["3.16.1", "3.18", "4.21.1", "4.22", "4.24", "4.26.1"],
    contenidos: 'Patologías médicas y quirúrgicas de los aparatos y sistemas. Enfermedades metabólicas, tóxicas y carenciales. Clínica médica y quirúrgica individual y poblacional. Método clínico, diagnóstico, pronóstico, tratamiento, control y prevención de las enfermedades en perros y gatos. Interpretación de diagnósticos complementarios. Emergentología. Etología. Prácticas Sociales Educativas. Conceptos aplicados sobre Bioseguridad, Bienestar Animal y Una Salud.' },
  { code: '5.30', nombre: 'Clínica Médica y Quirúrgica de Grandes Animales', anio: 5, cursado: 'anual', horas: 255, regulares: ["4.23"], aprobadas: ["4.26.1", "4.28.2", "5.32.2", "5.33.2"],
    contenidos: 'Patologías médicas y quirúrgicas de los aparatos y sistemas. Enfermedades metabólicas, tóxicas y carenciales. Clínica médica y quirúrgica individual y poblacional. Método clínico, diagnóstico, pronóstico, tratamiento, control y prevención de las enfermedades de equinos, bovinos, ovinos, caprinos y cerdos. Interpretación de diagnósticos complementarios. Emergentología. Etología. Prácticas Sociales Educativas. Conceptos aplicados sobre bioseguridad, bienestar animal y Una Salud.' },
  { code: '5.31.1', nombre: 'Higiene, Microbiología y Tecnología de los Alimentos de Origen Animal', anio: 5, cursado: '1c', horas: 120, regulares: [], aprobadas: ["3.18", "4.21.1"],
    contenidos: 'Microbiología y seguridad alimentaria: Ecología microbiana. Métodos de conservación de los alimentos. Enfermedades transmitidas por alimentos. Análisis de laboratorio. Legislación alimentaria. Buenas Prácticas de Manufactura. Procedimientos Operativos Estandarizados de Saneamiento. Manejo Integrado de Plagas. Sistema de Análisis de Peligros y Puntos Críticos de Control. Condiciones higiénico-sanitarias de los establecimientos elaboradores. Procesos tecnológicos de la industrialización de los distintos productos y subproductos de origen animal. Trazabilidad. Técnicas de inspección ante y post mortem: sus criterios sanitarios.' },
  { code: '5.32.2', nombre: 'Sistemas de Producción II', anio: 5, cursado: '2c', horas: 120, regulares: ["5.33.2"], aprobadas: ["3.16.1", "3.18", "3.19.2", "4.21.1", "4.22", "4.27.2"],
    contenidos: 'Sistemas de producción de carne, leche y lana. Cría, recría e invernada. Fisiología de la lactancia. Planificación y manejo de la alimentación. Instalaciones. Equipos de ordeño. Calidad del producto. Manejo de la reproducción. Mercado. Gestión estratégica de la empresa. Registros e indicadores.' },
  { code: '5.33.2', nombre: 'Obstetricia y Reproducción', anio: 5, cursado: '2c', horas: 90, regulares: [], aprobadas: ["3.16.1", "3.18", "4.21.1", "4.22", "4.24", "4.27.2"],
    contenidos: 'Fisiopatología de la reproducción. Ginecología. Andrología. Obstetricia.' },
];

export interface Curso { code: string; nombre: string; obligatorio: boolean; horas: number }
export interface SubOrientacion { id: string; nombre: string; cursos: Curso[] }
export interface Orientacion { letra: 'A' | 'B' | 'C'; nombre: string; subs: SubOrientacion[] }

/** Sexto año: se elige UNA sub orientación (500 hs). Correlativas para rendirla: todas las materias 1.1.1 a 5.33.2 aprobadas. */
export const ORIENTACIONES: Orientacion[] = [
  { letra: 'A', nombre: 'Salud Animal', subs: [
    { id: 'A.1', nombre: 'Salud de animales de compañía', cursos: [
      { code: 'SA-OB-01', nombre: 'Práctica hospitalaria en animales de compañía', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'SA-OB-02', nombre: 'Imagenología aplicada', obligatorio: true, horas: 30 },
      { code: 'SA-OB-03', nombre: 'Vacunología veterinaria en pequeños animales', obligatorio: true, horas: 30 },
      { code: 'SA-OP-01', nombre: 'Métodos complementarios de diagnóstico: el laboratorio en la práctica profesional', obligatorio: false, horas: 60 },
      { code: 'SA-OP-02', nombre: 'Inmunohematología y medicina transfusional en pequeños animales', obligatorio: false, horas: 30 },
      { code: 'SA-OP-03', nombre: 'Dermatología veterinaria', obligatorio: false, horas: 60 },
      { code: 'SA-OP-04', nombre: 'Prácticas hospitalarias en cirugía de perros y gatos', obligatorio: false, horas: 30 },
      { code: 'SA-OP-05', nombre: 'Medicina veterinaria integrativa', obligatorio: false, horas: 60 },
      { code: 'SA-OP-06', nombre: 'Métodos complementarios y biotecnologías aplicados a la reproducción de caninos y felinos', obligatorio: false, horas: 30 },
      { code: 'SA-OP-07', nombre: 'Imagenología aplicada a caninos y felinos', obligatorio: false, horas: 30 },
      { code: 'SA-OP-08', nombre: 'Farmacología clínica y terapéutica en caninos y felinos', obligatorio: false, horas: 30 },
      { code: 'SA-OP-10', nombre: 'Medicina veterinaria de mamíferos exóticos', obligatorio: false, horas: 30 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-03', nombre: 'Intervenciones asistidas con animales', obligatorio: false, horas: 60 },
    ] },
    { id: 'A.2', nombre: 'Salud de grandes animales', cursos: [
      { code: 'SA-OB-04', nombre: 'Práctica hospitalaria en grandes animales', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'SA-OB-02', nombre: 'Imagenología aplicada', obligatorio: true, horas: 30 },
      { code: 'SA-OB-05', nombre: 'Vacunología veterinaria en grandes animales', obligatorio: true, horas: 30 },
      { code: 'SA-OP-09', nombre: 'Farmacología clínica y terapéutica en bovinos, ovinos, porcinos y equinos', obligatorio: false, horas: 30 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-04', nombre: 'Clínica diagnóstica y terapéutica equina', obligatorio: false, horas: 60 },
      { code: 'TR-OP-05', nombre: 'Manejo aplicado en equino', obligatorio: false, horas: 30 },
      { code: 'TR-OP-06', nombre: 'Imagenología aplicada a equinos', obligatorio: false, horas: 30 },
      { code: 'TR-OP-07', nombre: 'Sanidad porcina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-08', nombre: 'Detección de celo y técnica de inseminación artificial en bovinos', obligatorio: false, horas: 30 },
    ] },
    { id: 'A.3', nombre: 'Salud de especies silvestres y domésticas no convencionales', cursos: [
      { code: 'SA-OB-06', nombre: 'Práctica hospitalaria en especies silvestres y domésticas no convencionales', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'SA-OB-02', nombre: 'Imagenología aplicada', obligatorio: true, horas: 30 },
      { code: 'SA-OB-07', nombre: 'Medicina veterinaria de especies silvestres: bases generales y taxones más comunes en rehabilitación', obligatorio: true, horas: 30 },
      { code: 'SA-OP-01', nombre: 'Métodos complementarios de diagnóstico: el laboratorio en la práctica profesional', obligatorio: false, horas: 60 },
      { code: 'SA-OP-08', nombre: 'Farmacología clínica y terapéutica en caninos y felinos', obligatorio: false, horas: 30 },
      { code: 'SA-OP-10', nombre: 'Medicina veterinaria de mamíferos exóticos', obligatorio: false, horas: 30 },
      { code: 'SA-OP-11', nombre: 'Medicina veterinaria de especies silvestres: taxones menos comunes en rehabilitación', obligatorio: false, horas: 30 },
      { code: 'SA-OP-12', nombre: 'Planes sanitarios en especies silvestres en cautiverio', obligatorio: false, horas: 15 },
      { code: 'SA-OP-13', nombre: 'Hematología básica de aves y reptiles', obligatorio: false, horas: 15 },
      { code: 'SA-OP-14', nombre: 'Medicina de aves ornamentales y reptiles exóticos', obligatorio: false, horas: 15 },
      { code: 'SA-OP-15', nombre: 'Biología de la conservación', obligatorio: false, horas: 15 },
      { code: 'SA-OP-16', nombre: 'Bienestar animal y etología aplicada en especies silvestres', obligatorio: false, horas: 15 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-09', nombre: 'Uso y cuidado de animales de laboratorio', obligatorio: false, horas: 60 },
      { code: 'TR-OP-10', nombre: 'Medicina de peces ornamentales', obligatorio: false, horas: 45 },
    ] },
  ] },
  { letra: 'B', nombre: 'Medicina Preventiva, Salud Pública y Bromatología', subs: [
    { id: 'B.1', nombre: 'Salud pública', cursos: [
      { code: 'MP-OB-01', nombre: 'Práctica en terreno en salud pública', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'MP-OB-02', nombre: 'Educación para la salud', obligatorio: true, horas: 30 },
      { code: 'MP-OB-03', nombre: 'Epidemiología aplicada a las zoonosis', obligatorio: true, horas: 30 },
      { code: 'MP-OP-01', nombre: 'Epidemiología aplicada a las ETAs', obligatorio: false, horas: 30 },
      { code: 'MP-OP-02', nombre: 'Administración y programación sanitaria', obligatorio: false, horas: 30 },
      { code: 'MP-OP-03', nombre: 'Protección ambiental', obligatorio: false, horas: 30 },
      { code: 'MP-OP-04', nombre: 'Aplicaciones informáticas en bioestadística y epidemiología', obligatorio: false, horas: 30 },
      { code: 'MP-OP-05', nombre: 'Epidemiología serológica', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-03', nombre: 'Intervenciones asistidas con animales', obligatorio: false, horas: 60 },
    ] },
    { id: 'B.2', nombre: 'Bromatología', cursos: [
      { code: 'MP-OB-04', nombre: 'Práctica en terreno en Bromatología', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'MP-OB-05', nombre: 'Buenas prácticas en la producción de agroalimentos', obligatorio: true, horas: 30 },
      { code: 'MP-OB-06', nombre: 'Legislación alimentaria', obligatorio: true, horas: 30 },
      { code: 'MP-OP-06', nombre: 'Procedimientos operativos estandarizados de saneamiento (POES)', obligatorio: false, horas: 30 },
      { code: 'MP-OP-07', nombre: 'Anatomía aplicada a la carcasa bovina y porcina', obligatorio: false, horas: 30 },
      { code: 'MP-OP-08', nombre: 'Auditoría en buenas prácticas de manufacturación de alimentos', obligatorio: false, horas: 30 },
      { code: 'MP-OP-09', nombre: 'Sistemas de control de calidad en la producción de alimentos', obligatorio: false, horas: 30 },
      { code: 'MP-OP-10', nombre: 'Chacinados', obligatorio: false, horas: 30 },
      { code: 'MP-OP-11', nombre: 'Conservas alimenticias', obligatorio: false, horas: 30 },
      { code: 'MP-OP-12', nombre: 'Tecnología y control de leche y productos lácteos', obligatorio: false, horas: 30 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
    ] },
  ] },
  { letra: 'C', nombre: 'Producción Animal', subs: [
    { id: 'C.1', nombre: 'Producción porcina', cursos: [
      { code: 'PA-OB-01', nombre: 'Práctica en terreno en Producción porcina', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-02', nombre: 'Gerenciamiento de la empresa agropecuaria', obligatorio: true, horas: 30 },
      { code: 'PA-OB-03', nombre: 'Nutrición y alimentación en porcinos', obligatorio: true, horas: 30 },
      { code: 'PA-OP-01', nombre: 'Gestión de la granja porcina', obligatorio: false, horas: 15 },
      { code: 'PA-OP-02', nombre: 'Reproducción en porcinos', obligatorio: false, horas: 15 },
      { code: 'PA-OP-03', nombre: 'Bioseguridad en sistemas de producción porcina', obligatorio: false, horas: 15 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-07', nombre: 'Sanidad porcina', obligatorio: false, horas: 30 },
    ] },
    { id: 'C.2', nombre: 'Producción de bovinos lecheros', cursos: [
      { code: 'PA-OB-04', nombre: 'Práctica en terreno en producción de bovinos lecheros', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-02', nombre: 'Gerenciamiento de la empresa agropecuaria', obligatorio: true, horas: 30 },
      { code: 'PA-OB-05', nombre: 'Agrostología', obligatorio: true, horas: 30 },
      { code: 'PA-OP-04', nombre: 'Nutrición y alimentación de bovinos lecheros', obligatorio: false, horas: 30 },
      { code: 'PA-OP-05', nombre: 'Reproducción de bovinos lecheros', obligatorio: false, horas: 30 },
      { code: 'PA-OP-06', nombre: 'Comportamiento de diferentes biotipos en los sistemas lecheros', obligatorio: false, horas: 15 },
      { code: 'PA-OP-07', nombre: 'Calidad de leche', obligatorio: false, horas: 15 },
      { code: 'PA-OP-08', nombre: 'Crianza artificial y recría en un sistema lechero', obligatorio: false, horas: 30 },
      { code: 'PA-OP-09', nombre: 'Enfoque holístico de los sistemas productivos lecheros', obligatorio: false, horas: 15 },
      { code: 'PA-OP-10', nombre: 'Indicadores de eficiencia biológica y económica en vacas', obligatorio: false, horas: 15 },
      { code: 'PA-OP-11', nombre: 'Programas informáticos en lechería', obligatorio: false, horas: 15 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-08', nombre: 'Detección de celo y técnica de inseminación artificial en bovinos', obligatorio: false, horas: 30 },
    ] },
    { id: 'C.3', nombre: 'Producción de bovinos para carne', cursos: [
      { code: 'PA-OB-06', nombre: 'Práctica en terreno en Producción de bovinos para carne', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-02', nombre: 'Gerenciamiento de la empresa agropecuaria', obligatorio: true, horas: 30 },
      { code: 'PA-OB-05', nombre: 'Agrostología', obligatorio: true, horas: 30 },
      { code: 'PA-OP-12', nombre: 'Nutrición y alimentación de bovinos para carne: cría – invernada – feedlot', obligatorio: false, horas: 30 },
      { code: 'PA-OP-13', nombre: 'Reproducción de bovinos para carne', obligatorio: false, horas: 30 },
      { code: 'PA-OP-14', nombre: 'Sistemas informáticos aplicados a producción de carne', obligatorio: false, horas: 30 },
      { code: 'PA-OP-15', nombre: 'Manejo sanitario poblacional en bovinos para carne', obligatorio: false, horas: 30 },
      { code: 'PA-OP-16', nombre: 'Gestión estratégica de empresas ganaderas', obligatorio: false, horas: 30 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-08', nombre: 'Detección de celo y técnica de inseminación artificial en bovinos', obligatorio: false, horas: 30 },
    ] },
    { id: 'C.4', nombre: 'Producción equina', cursos: [
      { code: 'PA-OB-07', nombre: 'Práctica en terreno en Producción equina', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-02', nombre: 'Gerenciamiento de la empresa agropecuaria', obligatorio: true, horas: 30 },
      { code: 'PA-OB-03', nombre: 'Agrostología', obligatorio: true, horas: 30 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-04', nombre: 'Clínica diagnóstica y terapéutica equina', obligatorio: false, horas: 60 },
      { code: 'TR-OP-05', nombre: 'Manejo aplicado en equino', obligatorio: false, horas: 30 },
      { code: 'TR-OP-06', nombre: 'Imagenología aplicada a equinos', obligatorio: false, horas: 30 },
      { code: 'PA-OP-17', nombre: 'Introducción a la producción equina: bases biológicas y sistemas de manejo', obligatorio: false, horas: 30 },
      { code: 'PA-OP-18', nombre: 'Producción equina avanzada: producción y sistemas aplicados', obligatorio: false, horas: 30 },
    ] },
    { id: 'C.5', nombre: 'Producción avícola', cursos: [
      { code: 'PA-OB-08', nombre: 'Práctica en terreno en Producción avícola', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-02', nombre: 'Gerenciamiento de la empresa agropecuaria', obligatorio: true, horas: 30 },
      { code: 'PA-OB-09', nombre: 'Sanidad en la producción avícola', obligatorio: true, horas: 30 },
      { code: 'PA-OP-19', nombre: 'Calidad de huevo en la producción avícola', obligatorio: false, horas: 15 },
      { code: 'PA-OP-20', nombre: 'Bioseguridad en la producción avícola', obligatorio: false, horas: 15 },
      { code: 'PA-OP-21', nombre: 'Indicadores de sustentabilidad en sistemas de producción avícola', obligatorio: false, horas: 15 },
      { code: 'PA-OP-22', nombre: 'Inmunoprofilaxis en aves', obligatorio: false, horas: 15 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
    ] },
    { id: 'C.6', nombre: 'Producción piscícola', cursos: [
      { code: 'PA-OB-10', nombre: 'Práctica en terreno en Producción piscícola', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-11', nombre: 'Piscicultura', obligatorio: true, horas: 60 },
      { code: 'PA-OP-23', nombre: 'Reproducción en peces', obligatorio: false, horas: 15 },
      { code: 'PA-OP-24', nombre: 'Nutrición y alimentación en el cultivo de peces', obligatorio: false, horas: 30 },
      { code: 'PA-OP-25', nombre: 'Tecnologías aplicadas al cultivo de peces', obligatorio: false, horas: 30 },
      { code: 'PA-OP-26', nombre: 'Bienestar en peces', obligatorio: false, horas: 15 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-10', nombre: 'Medicina de peces ornamentales', obligatorio: false, horas: 45 },
    ] },
    { id: 'C.7', nombre: 'Producción de pequeños rumiantes, pilíferos y especies no tradicionales', cursos: [
      { code: 'PA-OB-12', nombre: 'Práctica en terreno en Producción de pequeños rumiantes, pilíferos y especies no tradicionales', obligatorio: true, horas: 200 },
      { code: 'TR-OB-01', nombre: 'Metodología de la investigación aplicada a las ciencias veterinarias', obligatorio: true, horas: 30 },
      { code: 'PA-OB-02', nombre: 'Gerenciamiento de la empresa agropecuaria', obligatorio: true, horas: 30 },
      { code: 'PA-OB-03', nombre: 'Agrostología', obligatorio: true, horas: 30 },
      { code: 'PA-OP-27', nombre: 'Producción de conejos', obligatorio: false, horas: 30 },
      { code: 'PA-OP-28', nombre: 'Introducción a la producción apícola', obligatorio: false, horas: 30 },
      { code: 'PA-OP-29', nombre: 'Producción de ovinos y caprinos', obligatorio: false, horas: 30 },
      { code: 'PA-OP-30', nombre: 'Salud y reproducción de ovinos', obligatorio: false, horas: 30 },
      { code: 'TR-OP-01', nombre: 'Protección y bienestar animal', obligatorio: false, horas: 30 },
      { code: 'TR-OP-02', nombre: 'Taller de acompañamiento en la elaboración y presentación de la tesina', obligatorio: false, horas: 30 },
      { code: 'TR-OP-09', nombre: 'Uso y cuidado de animales de laboratorio', obligatorio: false, horas: 60 },
    ] },
  ] },
];
// ---------------------------------------------------------------------------------------------
// Equivalencias Plan 2009 → Plan 2026 (Anexo II: regulares; Anexo III: aprobadas).
// Las claves son los códigos 2009 que usa la app (en la app Fauna es 5.39.1 y Producción Equina 5.45.2;
// el documento los lista al revés). `p: true` = equivalencia parcial (hay que rendir contenidos faltantes).
// Los códigos de orientación (TR-OB-01, SA-OB-03, …) son cursos de sexto año.

export interface Destino { code: string; p?: boolean }

const EQ_REGULAR: Record<string, Destino[]> = {
  '1.1.1': [{ code: '1.1.1' }],
  '1.2.1': [{ code: '1.2.1', p: true }],
  '1.3.1': [{ code: '1.3.1' }],
  '1.4.1': [{ code: 'TR-OB-01' }],
  '1.5.2': [{ code: '1.4.2', p: true }, { code: '2.8.1' }],
  '1.6.2': [{ code: '1.5.2' }],
  '1.7.2': [{ code: '1.2.1' }],
  '2.8.1': [{ code: '1.4.2' }, { code: '2.11.2' }],
  '2.9.1': [{ code: '2.9', p: true }],
  '2.10.1': [{ code: '3.19.2', p: true }],
  '2.11.1': [{ code: '3.20.2' }],
  '2.12': [{ code: '2.9', p: true }],
  '2.13.2': [{ code: '4.27.2' }],
  '2.14.2': [{ code: '2.13.2' }],
  '2.15.2': [{ code: '3.18', p: true }],
  '3.16.1': [{ code: '3.14.1', p: true }],
  '3.17.1': [{ code: '4.23', p: true }],
  '3.18.1': [{ code: '4.22' }],
  '3.19.1': [{ code: '3.17', p: true }],
  '3.20.2': [{ code: '3.15' }],
  '3.21.2': [{ code: '2.10.1' }],
  '3.22.2': [{ code: '3.17' }],
  '3.23.2': [{ code: '4.24', p: true }],
  '3.24.2': [{ code: '1.6.2', p: true }],
  '4.25.1': [{ code: '3.18' }],
  '4.26.1': [{ code: '4.21.1' }],
  '4.27.1': [{ code: '4.24' }],
  '4.28.1': [{ code: '3.16.1' }],
  '4.29.1': [{ code: '1.6.2' }],
  '4.30.2': [{ code: '5.29', p: true }, { code: '5.30', p: true }],
  '4.31.2': [{ code: '5.29', p: true }, { code: '5.30', p: true }],
  '4.32.2': [{ code: '5.33.2' }],
  '4.33.2': [{ code: '4.26.1' }],
  '4.34.2': [{ code: '3.14.1' }, { code: 'SA-OB-03' }, { code: 'SA-OB-05' }, { code: 'PA-OP-22' }],
  '5.35.1': [{ code: '3.19.2' }, { code: 'PA-OB-05' }],
  '5.36.1': [{ code: '2.12.2' }],
  '5.37.1': [{ code: '4.28.2', p: true }, { code: '5.32.2', p: true }],
  '5.38.1': [{ code: '4.28.2', p: true }, { code: 'PA-OP-27' }],
  '5.39.1': [{ code: '4.25.1' }],
  '5.40.1': [{ code: '5.31.1', p: true }],
  '5.41.2': [{ code: '5.32.2', p: true }],
  '5.42.2': [{ code: '5.32.2', p: true }],
  '5.43.2': [{ code: '4.23' }],
  '5.44.2': [{ code: '5.31.1' }],
  '5.45.2': [{ code: 'PA-OP-17' }, { code: 'PA-OP-18' }],
  '6.46.1': [{ code: '5.29' }],
  '6.47.1': [{ code: '5.30' }],
};

/** Aprobadas: igual que regulares salvo Anatomía II (sólo Anatomía II) y Fisiología (Histofisiología total). */
const EQ_APROBADA: Record<string, Destino[]> = {
  ...EQ_REGULAR,
  '2.8.1': [{ code: '2.11.2' }],
  '2.12': [{ code: '2.9' }],
};

export function equivalencias(code2009: string, estado: 'regular' | 'aprobada'): Destino[] {
  return (estado === 'aprobada' ? EQ_APROBADA : EQ_REGULAR)[code2009] ?? [];
}

/** Materias del Plan 2009 que dan equivalencia (total o parcial) en una materia del Plan 2026 */
export function origenes2009(code2026: string): { code: string; p: boolean }[] {
  return Object.entries(EQ_REGULAR).flatMap(([c, ds]) => {
    const d = ds.find((x) => x.code === code2026);
    if (!d) return [];
    const ap = EQ_APROBADA[c].find((x) => x.code === code2026);
    return [{ code: c, p: !!d.p && !!ap?.p }];
  });
}

// ---------------------------------------------------------------------------------------------
// Plan de transición (Anexo I)

export interface Plazo {
  /** YYYY-MM-DD (31/12 de cada año) */
  fecha: string;
  articulo: string;
  /** Materias del Plan 2009 que hay que tener (si falta alguna, se pasa automáticamente al Plan 2026) */
  materias: string[];
  requisito: 'aprobada' | 'regular';
  texto: string;
}

export const PLAZOS: Plazo[] = [
  { fecha: '2027-12-31', articulo: 'Art. 6', materias: ['1.2.1'], requisito: 'aprobada', texto: 'Aprobar Química Biológica I' },
  { fecha: '2028-12-31', articulo: 'Art. 7', materias: ['2.9.1', '2.8.1', '2.12'], requisito: 'regular', texto: 'Regularizar Histología II, Anatomía II y Fisiología' },
  { fecha: '2030-12-31', articulo: 'Art. 8', materias: ['3.16.1', '3.22.2', '3.20.2'], requisito: 'regular', texto: 'Regularizar Inmunología, Patología Especial y Farmacología' },
  { fecha: '2031-12-31', articulo: 'Art. 9', materias: ['4.30.2', '4.31.2', '4.32.2'], requisito: 'regular', texto: 'Regularizar Patología Médica, Patología Quirúrgica y Obstetricia' },
];

/** Caducidad del Plan 2009 (Art. 10): quien no se reciba pasa al Plan 2026 con equivalencias. */
export const CADUCIDAD_2009 = '2036-12-31';
/** El Plan 2026 empieza a dictarse (1° año) en 2028 */
export const INICIO_2026 = 2028;

/** Cronograma (Art. 11): qué plan se dicta en cada año de la carrera, por año académico. */
export const CRONOGRAMA: { anio: number; cursos: ('2009' | '2026' | 'mixto')[]; nota?: string }[] = [
  { anio: 2028, cursos: ['2026', '2009', '2009', '2009', '2009', '2009'] },
  { anio: 2029, cursos: ['2026', '2026', '2009', '2009', '2009', '2009'] },
  { anio: 2030, cursos: ['2026', '2026', 'mixto', '2009', '2009', '2009'], nota: '3° año: Plan 2026 + Inmunología, Patología General y Especial y Farmacología y Terapéutica del Plan 2009' },
  { anio: 2031, cursos: ['2026', '2026', '2026', 'mixto', '2009', '2009'], nota: '4° año: Plan 2026 + Patología Médica, Patología Quirúrgica y Obstetricia y Fisiopatología de la Reproducción del Plan 2009' },
  { anio: 2032, cursos: ['2026', '2026', '2026', '2026', '2026', '2009'] },
  { anio: 2033, cursos: ['2026', '2026', '2026', '2026', '2026', '2026'] },
];
