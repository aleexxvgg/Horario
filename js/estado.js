// Estado de la aplicación y funciones de ayuda (fechas, filtros y guardado).

const porId = (id) => document.getElementById(id);
const raiz = document.documentElement;

// Nombres con los que se guarda cada cosa en el dispositivo
const CLAVES = {
  horario: 'horario-clases',
  examenes: 'horario-examenes',
  tema: 'horario-theme',
  tamanoLetra: 'horario-fs',
  contraste: 'horario-hc',
  futurista: 'horario-fx',
  titulo: 'horario2-title',
  curso: 'horario2-course'
};

let horario = copiar(HORARIO_INICIAL);
let examenes = [];            // { id, asignatura, fecha: 'aaaa-mm-dd', nota }
let filtro = {};              // { profesor, asignatura }: lo que está marcado en el horario
let diaSeleccionado = 0;      // día que se ve en el móvil
let claseElegida = null;      // clase abierta en el menú
let tamanoLetra = 0;          // 0, 1 o 2
let altoContraste = false;
let estiloFuturista = true;

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const diaDeHoy = calcularDiaDeHoy();          // 0 = lunes ... 4 = viernes, -1 = fin de semana
let mesDelCalendario = new Date(hoy().getFullYear(), hoy().getMonth(), 1);
let diaDelCalendario = textoDesdeFecha(hoy());

if (diaDeHoy >= 0) {
  diaSeleccionado = diaDeHoy;
}

// ---------- Guardado en el dispositivo ----------

function copiar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function leer(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // si el navegador no deja guardar, la app sigue funcionando
  }
}

function leerJSON(clave) {
  try {
    return JSON.parse(leer(clave));
  } catch {
    return null;
  }
}

function guardarHorario() {
  guardar(CLAVES.horario, JSON.stringify(horario));
}

function guardarExamenes() {
  guardar(CLAVES.examenes, JSON.stringify(examenes));
}

// Carga lo que hubiera guardado. Las versiones anteriores guardaban las clases
// como listas [inicio, horas, asignatura, profesor, aula], por eso se convierten.
function cargarDatosGuardados() {
  const clasesGuardadas = leerJSON(CLAVES.horario);
  const clasesAntiguas = leerJSON('horario-v2');
  if (clasesGuardadas) {
    horario = clasesGuardadas;
  } else if (clasesAntiguas) {
    horario = clasesAntiguas.map((dia) =>
      dia.map(([inicio, horas, asignatura, profesor, aula]) => clase(inicio, horas, asignatura, profesor, aula))
    );
  }

  const examenesGuardados = leerJSON(CLAVES.examenes);
  const examenesAntiguos = leerJSON('horario-ex');
  if (examenesGuardados) {
    examenes = examenesGuardados;
  } else if (examenesAntiguos) {
    examenes = examenesAntiguos.map((e) => ({ id: e.id, asignatura: e.k, fecha: e.date, nota: e.note }));
  }
}

function cargarPreferencias() {
  const titulo = leer(CLAVES.titulo);
  const curso = leer(CLAVES.curso);
  if (titulo) porId('title').textContent = titulo;
  if (curso) porId('course').textContent = curso;

  const tema = leer(CLAVES.tema);
  if (tema === 'auto') {
    delete raiz.dataset.theme;
  } else {
    raiz.dataset.theme = tema || 'cyber';
  }

  tamanoLetra = Number(leer(CLAVES.tamanoLetra)) || 0;
  altoContraste = leer(CLAVES.contraste) === '1';
  estiloFuturista = leer(CLAVES.futurista) !== '0';
}

// ---------- Fechas ----------

function hoy() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function calcularDiaDeHoy() {
  const dia = new Date().getDay();       // 0 = domingo
  return dia >= 1 && dia <= 5 ? dia - 1 : -1;
}

// 'aaaa-mm-dd' -> Date
function fechaDesdeTexto(texto) {
  const [anio, mes, dia] = texto.split('-');
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
}

// Date -> 'aaaa-mm-dd'
function textoDesdeFecha(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function diasHasta(texto) {
  return Math.round((fechaDesdeTexto(texto) - hoy()) / MS_POR_DIA);
}

function fechaLarga(texto) {
  return fechaDesdeTexto(texto).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Lunes de esta semana (o de la siguiente, si hoy es sábado o domingo)
function lunesDeLaSemana() {
  const dia = hoy();
  const diasDesdeElLunes = (dia.getDay() + 6) % 7;
  const ajuste = diasDesdeElLunes >= 5 ? 7 : 0;
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() - diasDesdeElLunes + ajuste);
}

function textoCuentaAtras(dias) {
  if (dias < 0) return 'Ya pasó';
  if (dias === 0) return '¡Hoy!';
  if (dias === 1) return 'Mañana';
  return `En ${dias} días`;
}

// ---------- Exámenes ----------

// ¿Hay un examen de esta asignatura ese día de la semana (0 = lunes)?
function hayExamen(asignatura, dia) {
  const lunes = lunesDeLaSemana();
  const fecha = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + dia);
  return examenes.some((examen) =>
    examen.asignatura === asignatura && fechaDesdeTexto(examen.fecha).getTime() === fecha.getTime()
  );
}

function proximoExamen() {
  return examenes
    .filter((examen) => diasHasta(examen.fecha) >= 0)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
}

function textoProximoExamen() {
  const examen = proximoExamen();
  if (!examen) return '';
  const nombre = asignaturaDe(examen.asignatura).nombre;
  const cuando = textoCuentaAtras(diasHasta(examen.fecha)).toLowerCase();
  return ` Próximo examen: <b>${nombre}</b> (${cuando}).`;
}

// ---------- Horario ----------

function asignaturaDe(clave) {
  return ASIGNATURAS[clave] || ASIGNATURA_DESCONOCIDA;
}

// '8:30' -> 510
function aMinutos(hora) {
  const [horas, minutos] = hora.split(':');
  return Number(horas) * 60 + Number(minutos);
}

// Fila de la tabla en la que va cada hora (la 1 es la cabecera y la 4 el recreo)
function filaDeLaHora(indice) {
  return indice < RECREO_ANTES_DE ? indice + 2 : indice + 3;
}

function horaFin(clase) {
  return HORAS[clase.inicio + clase.horas - 1].fin;
}

// Número de la hora que está en marcha ahora mismo, o -1
function horaEnCurso() {
  if (diaDeHoy < 0) return -1;
  const ahora = new Date();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  return HORAS.findIndex((hora) => minutos >= aMinutos(hora.inicio) && minutos < aMinutos(hora.fin));
}

function hayFiltro() {
  return Boolean(filtro.profesor || filtro.asignatura);
}

function coincideConFiltro(clase) {
  const esDelProfesor = !filtro.profesor || clase.profesor === filtro.profesor;
  const esDeLaAsignatura = !filtro.asignatura || clase.asignatura === filtro.asignatura;
  return esDelProfesor && esDeLaAsignatura;
}

function todasLasClases() {
  return horario.flat();
}

function listaDeProfesores() {
  return [...new Set(todasLasClases().map((c) => c.profesor))];
}

// Suma las horas de las clases que cumplen la condición
function contarHoras(cumple) {
  return todasLasClases().filter(cumple).reduce((total, c) => total + c.horas, 0);
}

function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map((palabra) => palabra[0]).join('');
}

// Evita que un texto escrito por el usuario rompa el HTML
function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
