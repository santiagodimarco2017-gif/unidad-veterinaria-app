import type { ExamDate, AcademicMilestone, CalendarDayEvents } from '../types';

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// 1. Academic Milestones & Holidays 2026
export const ACADEMIC_MILESTONES_2026: AcademicMilestone[] = [
  // Febrero
  { dateStr: '2026-02-02', title: 'Inicio del Año Lectivo y Ciclo de Nivelación', type: 'inicio_clases', description: 'Comienza el Ciclo de Nivelación para ingresantes a Medicina Veterinaria.' },
  { dateStr: '2026-02-09', title: 'Inicio Turno Febrero-Marzo (Exámenes)', type: 'otro', description: 'Primer llamado del turno Febrero-Marzo.' },
  { dateStr: '2026-02-16', title: 'Inicio Inscripción Guaraní - 1er Cuatrimestre', type: 'inscripcion_guarani', description: 'Apertura de inscripciones a cursadas de asignaturas del 1er Cuatrimestre.' },
  { dateStr: '2026-02-16', title: 'Feriado: Carnaval', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-02-17', title: 'Feriado: Carnaval', type: 'feriado', description: 'No hay actividades académicas.' },

  // Marzo
  { dateStr: '2026-03-06', title: 'Cierre Inscripción Guaraní - 1er Cuatrimestre', type: 'inscripcion_guarani', description: 'Cierre a las 23:59 hs de inscripción a cursadas.' },
  { dateStr: '2026-03-13', title: 'Fin del Ciclo de Nivelación', type: 'fin_clases', description: 'Finaliza el dictado del ciclo para ingresantes.' },
  { dateStr: '2026-03-16', title: 'INICIO DE CLASES 1er Cuatrimestre', type: 'inicio_cuatrimestre', description: 'Comienzo de clases teóricas y prácticas del primer cuatrimestre.' },
  { dateStr: '2026-03-23', title: 'Feriado Turístico', type: 'feriado', description: 'Día no laborable con fines turísticos.' },
  { dateStr: '2026-03-24', title: 'Feriado: Día de la Memoria por la Verdad y la Justicia', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-03-31', title: 'Fin Turno Febrero-Marzo', type: 'otro', description: 'Finaliza el 4to llamado de exámenes finales.' },

  // Abril
  { dateStr: '2026-04-02', title: 'Feriado: Día del Veterano y de los Caídos en Malvinas', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-04-03', title: 'Feriado: Viernes Santo (Semana Santa)', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-04-06', title: 'Inicio Turno Especial de Abril', type: 'otro', description: 'Turno especial con único llamado.' },

  // Mayo
  { dateStr: '2026-05-01', title: 'Feriado: Día Internacional de los Trabajadores', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-05-08', title: 'Inicio Mesas Escalonadas de Mayo', type: 'otro', description: 'Exámenes finales en modalidad escalonada.' },
  { dateStr: '2026-05-25', title: 'Feriado: Día de la Revolución de Mayo', type: 'feriado', description: 'No hay actividades académicas.' },

  // Junio
  { dateStr: '2026-06-05', title: 'Inicio Mesas Escalonadas de Junio', type: 'otro', description: 'Exámenes finales en modalidad escalonada.' },
  { dateStr: '2026-06-15', title: 'Feriado: Paso a la Inmortalidad del Gral. Güemes', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-06-26', title: 'FIN DE CLASES 1er Cuatrimestre', type: 'fin_clases', description: 'Finalizan las clases teóricas y prácticas del primer cuatrimestre.' },
  { dateStr: '2026-06-29', title: 'Feriado: San Pedro y San Pablo (Patrono Casilda)', type: 'feriado', description: 'No hay actividades académicas en la sede Casilda.' },
  { dateStr: '2026-06-30', title: 'Inicio Turno Julio (1er Llamado)', type: 'otro', description: 'Turno ordinario de invierno.' },

  // Julio
  { dateStr: '2026-07-01', title: 'Inicio Inscripción Guaraní - 2do Cuatrimestre', type: 'inscripcion_guarani', description: 'Apertura de inscripciones a cursadas para el segundo cuatrimestre.' },
  { dateStr: '2026-07-06', title: 'Inicio Receso de Invierno', type: 'receso', description: 'Vacaciones de invierno (del 6 al 17 de julio).' },
  { dateStr: '2026-07-09', title: 'Feriado: Día de la Independencia', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-07-17', title: 'Fin Receso de Invierno', type: 'receso', description: 'Finaliza el receso invernal.' },
  { dateStr: '2026-07-19', title: 'Cierre Inscripción Guaraní - 2do Cuatrimestre', type: 'inscripcion_guarani', description: 'Cierre a las 23:59 hs de inscripciones a cursadas.' },
  { dateStr: '2026-07-20', title: 'Inicio Turno Julio (2do Llamado)', type: 'otro', description: 'Segundo llamado del turno invierno.' },
  { dateStr: '2026-07-27', title: 'INICIO DE CLASES 2do Cuatrimestre', type: 'inicio_cuatrimestre', description: 'Comienzo del segundo cuatrimestre académico.' },
  { dateStr: '2026-07-29', title: 'Día del Docente Universitario', type: 'feriado', description: 'No se dictan clases.' },

  // Agosto
  { dateStr: '2026-08-03', title: 'Inicio Turno Agosto', type: 'otro', description: 'Turno ordinario con único llamado.' },
  { dateStr: '2026-08-17', title: 'Feriado: Paso a la Inmortalidad del Gral. San Martín', type: 'feriado', description: 'No hay actividades académicas.' },

  // Septiembre
  { dateStr: '2026-09-04', title: 'Inicio Mesas Escalonadas de Septiembre', type: 'otro', description: 'Exámenes finales en modalidad escalonada.' },
  { dateStr: '2026-09-21', title: 'Día del Estudiante', type: 'feriado', description: 'No se dictan clases.' },
  { dateStr: '2026-09-29', title: 'Feriado: Declaración de Casilda como Ciudad', type: 'feriado', description: 'Aniversario de la ciudad de Casilda.' },

  // Octubre
  { dateStr: '2026-10-02', title: 'Inicio Mesas Escalonadas de Octubre', type: 'otro', description: 'Exámenes finales en modalidad escalonada.' },
  { dateStr: '2026-10-12', title: 'Feriado: Día del Respeto a la Diversidad Cultural', type: 'feriado', description: 'No hay actividades académicas.' },

  // Noviembre
  { dateStr: '2026-11-13', title: 'FIN DE CLASES 2do Cuatrimestre', type: 'fin_clases', description: 'Finalizan las clases teóricas y prácticas del segundo cuatrimestre.' },
  { dateStr: '2026-11-16', title: 'Inicio Turno Noviembre-Diciembre (1er Llamado)', type: 'otro', description: 'Primer llamado del turno ordinario de fin de año.' },
  { dateStr: '2026-11-23', title: 'Feriado: Día de la Soberanía Nacional', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-11-26', title: 'Feriado: Día del Trabajador No Docente', type: 'feriado', description: 'No hay actividades en la facultad.' },
  { dateStr: '2026-11-30', title: 'Inicio Turno Noviembre-Diciembre (2do Llamado)', type: 'otro', description: 'Segundo llamado.' },

  // Diciembre
  { dateStr: '2026-12-07', title: 'Feriado Turístico', type: 'feriado', description: 'Día no laborable con fines turísticos.' },
  { dateStr: '2026-12-08', title: 'Feriado: Inmaculada Concepción de la Virgen', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-12-14', title: 'Inicio Turno Noviembre-Diciembre (3er Llamado)', type: 'otro', description: 'Tercer llamado del turno de fin de año.' },
  { dateStr: '2026-12-25', title: 'Feriado: Navidad', type: 'feriado', description: 'No hay actividades académicas.' },
  { dateStr: '2026-12-31', title: 'Fin del Año Lectivo 2026', type: 'fin_clases', description: 'Cierre formal del año lectivo y de exámenes.' }
];

// Helper to construct date string
function formatDDMMYY(ddmmyy: string): string {
  const parts = ddmmyy.split('-');
  if (parts.length !== 3) return '';
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = '20' + parts[2];
  return `${year}-${month}-${day}`;
}

// Raw tables mapping from official resolution
const RAW_EXAM_TABLES: Array<{
  code: string;
  name: string;
  febMar: [string, string, string, string];
  abril: string;
  julio: [string, string];
  agosto: string;
  novDic: [string, string, string];
  escalonadas: { mayo: string; junio: string; septiembre: string; octubre: string };
}> = [
  {
    code: '1.1.1', name: 'Física Biológica',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '1.2.1', name: 'Química Biológica I',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '1.7.2', name: 'Química Biológica II',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '1.3.1', name: 'Biología y Ecología',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '1.4.1', name: 'Metodología de la Investigación',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '1.5.2', name: 'Anatomía Descriptiva y Comparada I',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '1.6.2', name: 'Histología I y Embriología Básica',
    febMar: ['13-02-26', '27-02-26', '13-03-26', '27-03-26'],
    abril: '10-04-26',
    julio: ['03-07-26', '24-07-26'],
    agosto: '07-08-26',
    novDic: ['20-11-26', '04-12-26', '18-12-26'],
    escalonadas: { mayo: '08-05-26', junio: '05-06-26', septiembre: '04-09-26', octubre: '02-10-26' }
  },
  {
    code: '2.8.1', name: 'Anatomía Descriptiva y Comparada II',
    febMar: ['13-02-26', '27-02-26', '13-03-26', '27-03-26'],
    abril: '10-04-26',
    julio: ['03-07-26', '24-07-26'],
    agosto: '07-08-26',
    novDic: ['20-11-26', '04-12-26', '18-12-26'],
    escalonadas: { mayo: '08-05-26', junio: '05-06-26', septiembre: '04-09-26', octubre: '02-10-26' }
  },
  {
    code: '2.9.1', name: 'Histología II y Embriología Especial',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['01-07-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '2.10.1', name: 'Zootecnia General',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '2.11.1', name: 'Bioestadística',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '2.12', name: 'Fisiología',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['02-07-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '2.14.2', name: 'Microbiología',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '2.15.2', name: 'Parasitología Veterinaria',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '2.13.2', name: 'Genética',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '3.16.1', name: 'Inmunología',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '3.17.1', name: 'Epidemiología',
    febMar: ['13-02-26', '27-02-26', '13-03-26', '27-03-26'],
    abril: '10-04-26',
    julio: ['03-07-26', '24-07-26'],
    agosto: '07-08-26',
    novDic: ['20-11-26', '04-12-26', '18-12-26'],
    escalonadas: { mayo: '08-05-26', junio: '05-06-26', septiembre: '04-09-26', octubre: '02-10-26' }
  },
  {
    code: '3.18.1', name: 'Semiología y Análisis Clínicos',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '3.20.2', name: 'Farmacología y Terapéutica',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '3.21.2', name: 'Sociología Rural, Agroecología y Extensión',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '3.23.2', name: 'Cirugía I',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '3.24.2', name: 'Inglés I',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '3.22.2', name: 'Patología Especial Veterinaria',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '3.19.1', name: 'Patología General Veterinaria',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '4.25.1', name: 'Enfermedades Parasitarias',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '4.26.1', name: 'Enfermedades Infecciosas',
    febMar: ['13-02-26', '27-02-26', '13-03-26', '27-03-26'],
    abril: '10-04-26',
    julio: ['03-07-26', '24-07-26'],
    agosto: '07-08-26',
    novDic: ['20-11-26', '04-12-26', '18-12-26'],
    escalonadas: { mayo: '08-05-26', junio: '05-06-26', septiembre: '04-09-26', octubre: '02-10-26' }
  },
  {
    code: '4.28.1', name: 'Nutrición Animal',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '09-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '4.29.1', name: 'Inglés II',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '4.30.2', name: 'Patología Médica',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '4.31.2', name: 'Patología Quirúrgica',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '4.32.2', name: 'Obstetricia y Fisiopatología de la Reproducción',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '4.33.2', name: 'Ética y Legislación Veterinaria',
    febMar: ['13-02-26', '27-02-26', '13-03-26', '27-03-26'],
    abril: '10-04-26',
    julio: ['03-07-26', '24-07-26'],
    agosto: '07-08-26',
    novDic: ['20-11-26', '04-12-26', '18-12-26'],
    escalonadas: { mayo: '08-05-26', junio: '05-06-26', septiembre: '04-09-26', octubre: '02-10-26' }
  },
  {
    code: '4.34.2', name: 'Sueros y Vacunas',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '4.27.1', name: 'Cirugía II',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '5.35.1', name: 'Agrostología',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '5.36.1', name: 'Economía Agraria y Administración Rural',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '5.37.1', name: 'Producción de Porcinos y Pequeños Rumiantes',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '5.38.1', name: 'Producción de Aves y Pilíferos',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '5.45.2', name: 'Producción Equina',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '5.41.2', name: 'Producción de Bovinos Lecheros',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '5.42.2', name: 'Producción de Bovinos para Carne',
    febMar: ['10-02-26', '24-02-26', '10-03-26', '31-03-26'],
    abril: '07-04-26',
    julio: ['30-06-26', '21-07-26'],
    agosto: '04-08-26',
    novDic: ['17-11-26', '01-12-26', '15-12-26'],
    escalonadas: { mayo: '26-05-26', junio: '23-06-26', septiembre: '22-09-26', octubre: '20-10-26' }
  },
  {
    code: '5.43.2', name: 'Salud Pública: Epidemiología, Saneamiento, Educación y Administración',
    febMar: ['13-02-26', '27-02-26', '13-03-26', '27-03-26'],
    abril: '10-04-26',
    julio: ['03-07-26', '24-07-26'],
    agosto: '07-08-26',
    novDic: ['20-11-26', '04-12-26', '18-12-26'],
    escalonadas: { mayo: '08-05-26', junio: '05-06-26', septiembre: '04-09-26', octubre: '02-10-26' }
  },
  {
    code: '5.39.1', name: 'Medicina Veterinaria, Manejo y Conservación de Fauna Silvestre',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['18-11-26', '02-12-26', '16-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '5.40.1', name: 'Higiene y Microbiología de los Alimentos',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  },
  {
    code: '6.46.1', name: 'Clínica de Animales de Compañía',
    febMar: ['11-02-26', '25-02-26', '11-03-26', '25-03-26'],
    abril: '08-04-26',
    julio: ['01-07-26', '22-07-26'],
    agosto: '05-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '20-05-26', junio: '17-06-26', septiembre: '16-09-26', octubre: '14-10-26' }
  },
  {
    code: '6.47.1', name: 'Clínica Médica y Quirúrgica de Grandes Animales',
    febMar: ['12-02-26', '26-02-26', '12-03-26', '26-03-26'],
    abril: '09-04-26',
    julio: ['02-07-26', '23-07-26'],
    agosto: '06-08-26',
    novDic: ['19-11-26', '03-12-26', '17-12-26'],
    escalonadas: { mayo: '14-05-26', junio: '11-06-26', septiembre: '10-09-26', octubre: '08-10-26' }
  },
  {
    code: '5.44.2', name: 'Tecnología de los Alimentos de Origen Animal',
    febMar: ['09-02-26', '23-02-26', '09-03-26', '30-03-26'],
    abril: '06-04-26',
    julio: ['30-06-26', '20-07-26'],
    agosto: '03-08-26',
    novDic: ['16-11-26', '30-11-26', '14-12-26'],
    escalonadas: { mayo: '18-05-26', junio: '22-06-26', septiembre: '28-09-26', octubre: '26-10-26' }
  }
];

// Orientación Dates (6.48.1)
const ORIENTACION_DATES: Array<{ date: string; turn: string }> = [
  { date: '18-02-26', turn: 'Ciclo de Orientación (Febrero)' },
  { date: '18-03-26', turn: 'Ciclo de Orientación (Marzo)' },
  { date: '15-04-26', turn: 'Ciclo de Orientación (Abril)' },
  { date: '20-05-26', turn: 'Ciclo de Orientación (Mayo)' },
  { date: '24-06-26', turn: 'Ciclo de Orientación (Junio)' },
  { date: '05-08-26', turn: 'Ciclo de Orientación (Agosto)' },
  { date: '02-09-26', turn: 'Ciclo de Orientación (Septiembre 1)' },
  { date: '30-09-26', turn: 'Ciclo de Orientación (Septiembre 2)' },
  { date: '21-10-26', turn: 'Ciclo de Orientación (Octubre)' },
  { date: '18-11-26', turn: 'Ciclo de Orientación (Noviembre)' },
  { date: '16-12-26', turn: 'Ciclo de Orientación (Diciembre)' }
];

// Generate consolidated list of all exam dates in 2026
export function getAllExamDates2026(): ExamDate[] {
  const list: ExamDate[] = [];

  RAW_EXAM_TABLES.forEach((row) => {
    // Feb-Mar
    row.febMar.forEach((d, idx) => {
      const formatted = formatDDMMYY(d);
      if (formatted) {
        list.push({
          subjectCode: row.code,
          subjectName: row.name,
          dateStr: formatted,
          turnName: `Turno Feb-Mar (${idx + 1}º Llamado)`,
          timeStr: '8.30 hs'
        });
      }
    });

    // Abril
    if (row.abril) {
      const formatted = formatDDMMYY(row.abril);
      if (formatted) {
        list.push({
          subjectCode: row.code,
          subjectName: row.name,
          dateStr: formatted,
          turnName: 'Turno Abril (Único Llamado)',
          timeStr: '8.30 hs'
        });
      }
    }

    // Julio
    row.julio.forEach((d, idx) => {
      const formatted = formatDDMMYY(d);
      if (formatted) {
        list.push({
          subjectCode: row.code,
          subjectName: row.name,
          dateStr: formatted,
          turnName: `Turno Julio (${idx + 1}º Llamado)`,
          timeStr: '8.30 hs'
        });
      }
    });

    // Agosto
    if (row.agosto) {
      const formatted = formatDDMMYY(row.agosto);
      if (formatted) {
        list.push({
          subjectCode: row.code,
          subjectName: row.name,
          dateStr: formatted,
          turnName: 'Turno Agosto (Único Llamado)',
          timeStr: '8.30 hs'
        });
      }
    }

    // Nov-Dic
    row.novDic.forEach((d, idx) => {
      const formatted = formatDDMMYY(d);
      if (formatted) {
        list.push({
          subjectCode: row.code,
          subjectName: row.name,
          dateStr: formatted,
          turnName: `Turno Nov-Dic (${idx + 1}º Llamado)`,
          timeStr: '8.30 hs'
        });
      }
    });

    // Escalonadas
    if (row.escalonadas.mayo) {
      list.push({
        subjectCode: row.code,
        subjectName: row.name,
        dateStr: formatDDMMYY(row.escalonadas.mayo),
        turnName: 'Mesa Escalonada Mayo',
        timeStr: '8.30 hs'
      });
    }
    if (row.escalonadas.junio) {
      list.push({
        subjectCode: row.code,
        subjectName: row.name,
        dateStr: formatDDMMYY(row.escalonadas.junio),
        turnName: 'Mesa Escalonada Junio',
        timeStr: '8.30 hs'
      });
    }
    if (row.escalonadas.septiembre) {
      list.push({
        subjectCode: row.code,
        subjectName: row.name,
        dateStr: formatDDMMYY(row.escalonadas.septiembre),
        turnName: 'Mesa Escalonada Septiembre',
        timeStr: '8.30 hs'
      });
    }
    if (row.escalonadas.octubre) {
      list.push({
        subjectCode: row.code,
        subjectName: row.name,
        dateStr: formatDDMMYY(row.escalonadas.octubre),
        turnName: 'Mesa Escalonada Octubre',
        timeStr: '8.30 hs'
      });
    }
  });

  // Ciclo de Orientación (6.48.1)
  ORIENTACION_DATES.forEach((item) => {
    list.push({
      subjectCode: '6.48.1',
      subjectName: 'Ciclo de Orientación',
      dateStr: formatDDMMYY(item.date),
      turnName: item.turn,
      timeStr: '8.30 hs'
    });
  });

  return list;
}

// Generate complete calendar month structure for 2026
export function getMonthCalendarData(year: number = 2026, month: number): CalendarDayEvents[] {
  const allExams = getAllExamDates2026();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysList: CalendarDayEvents[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dateObj = new Date(year, month - 1, d);
    const dayOfWeekIndex = dateObj.getDay();
    const dayOfWeekName = DAY_NAMES[dayOfWeekIndex];

    const dayExams = allExams.filter((e) => e.dateStr === dateStr);
    const dayMilestones = ACADEMIC_MILESTONES_2026.filter((m) => m.dateStr === dateStr);

    const isFeriado = dayMilestones.some((m) => m.type === 'feriado' || m.type === 'receso');
    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;

    daysList.push({
      dateStr,
      dayNumber: d,
      monthNumber: month,
      yearNumber: year,
      dayOfWeekName,
      exams: dayExams,
      milestones: dayMilestones,
      isNonWorkingDay: isFeriado || isWeekend
    });
  }

  return daysList;
}
