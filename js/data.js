// Datos de la aplicación.
// Para cambiar el horario, los profesores, los colores o los temas, se edita este archivo.

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V'];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Las seis horas de clase. El recreo (10:20 - 10:40) va antes de la tercera.
const HORAS = [
  { inicio: '8:30', fin: '9:25' },
  { inicio: '9:25', fin: '10:20' },
  { inicio: '10:40', fin: '11:35' },
  { inicio: '11:35', fin: '12:30' },
  { inicio: '12:40', fin: '13:35' },
  { inicio: '13:35', fin: '14:30' }
];
const RECREO_ANTES_DE = 2;

// tono: color de la asignatura (de 0 a 360)
// escala: tamaño de la letra, porque cada tipografía se ve más grande o más pequeña
const ASIGNATURAS = {
  mme: { nombre: 'Montaje y Mant. de Equipos', tono: 205, emoji: '🔧', fuente: "'Oswald', sans-serif", escala: 1.1 },
  ipe: { nombre: 'Itinerario Personal para la Empleabilidad', tono: 30, emoji: '🧭', fuente: "'Caveat', cursive", escala: 1.3 },
  ini: { nombre: 'Iniciación a la PR', tono: 325, emoji: '💡', fuente: "'Pacifico', cursive", escala: 0.95 },
  sor: { nombre: 'Sistemas Operativos en Red', tono: 282, emoji: '🖥️', fuente: "'JetBrains Mono', monospace", escala: 0.82 },
  ser: { nombre: 'Servicios en Red', tono: 170, emoji: '🌐', fuente: "'Space Grotesk', sans-serif", escala: 1 },
  web: { nombre: 'Aplicaciones Web', tono: 5, emoji: '🕸️', fuente: "'Fredoka', sans-serif", escala: 1.05 },
  pin: { nombre: 'Proyecto Intermodular', tono: 125, emoji: '🧩', fuente: "'Playfair Display', serif", escala: 1 },
  dig: { nombre: 'Digitalización de Sectores', tono: 52, emoji: '📡', fuente: "'Orbitron', sans-serif", escala: 0.8 },
  soat: { nombre: 'SOAT. Sistemas', tono: 245, emoji: '🛡️', fuente: "'Special Elite', monospace", escala: 0.95 }
};

// Se usa si una clase tiene una asignatura que no existe
const ASIGNATURA_DESCONOCIDA = { nombre: '?', tono: 220, emoji: '📘', fuente: 'inherit', escala: 1 };

const MANCHADO = 'Manchado Morag';
const CASADO = 'Casado Sanz Mari';
const GONZALEZ = 'Gonzalez Gonzal';

// inicio: número de la primera hora (0 es la de las 8:30)
// horas: cuántas horas seguidas dura la clase
function clase(inicio, horas, asignatura, profesor, aula = 'B22') {
  return { inicio, horas, asignatura, profesor, aula };
}

const HORARIO_INICIAL = [
  // Lunes
  [
    clase(0, 2, 'mme', MANCHADO),
    clase(2, 1, 'ini', CASADO),
    clase(3, 1, 'sor', MANCHADO),
    clase(4, 1, 'ipe', MANCHADO),
    clase(5, 1, 'ser', GONZALEZ)
  ],
  // Martes
  [
    clase(0, 1, 'ipe', MANCHADO),
    clase(1, 1, 'ini', CASADO),
    clase(2, 2, 'ser', GONZALEZ),
    clase(4, 1, 'web', CASADO),
    clase(5, 1, 'pin', MANCHADO)
  ],
  // Miércoles
  [
    clase(0, 2, 'mme', MANCHADO),
    clase(2, 2, 'web', CASADO),
    clase(4, 2, 'sor', MANCHADO)
  ],
  // Jueves
  [
    clase(0, 1, 'dig', CASADO),
    clase(1, 1, 'sor', MANCHADO),
    clase(2, 1, 'ipe', MANCHADO),
    clase(3, 1, 'ser', GONZALEZ),
    clase(4, 1, 'mme', MANCHADO),
    clase(5, 1, 'ini', CASADO)
  ],
  // Viernes
  [
    clase(0, 1, 'web', CASADO),
    clase(1, 1, 'soat', MANCHADO),
    clase(2, 1, 'sor', MANCHADO),
    clase(3, 1, 'mme', MANCHADO),
    clase(4, 2, 'ser', GONZALEZ)
  ]
];

// Temas de color (los colores reales están en css/06-calendario-temas.css)
// fondo1, fondo2, acento y texto sirven solo para dibujar la muestra del selector
const TEMAS = [
  { id: 'auto', nombre: 'Automático', fondo1: '#eceaff', fondo2: '#15132e', acento: '#4a3ae0', texto: '#23204a' },
  { id: 'cyber', nombre: 'Cyber', fondo1: '#050912', fondo2: '#0a2a4a', acento: '#00e5ff', texto: '#e8fbff' },
  { id: 'light', nombre: 'Claro', fondo1: '#eceaff', fondo2: '#ffe9f3', acento: '#4a3ae0', texto: '#23204a' },
  { id: 'dark', nombre: 'Oscuro', fondo1: '#15132e', fondo2: '#2a1330', acento: '#a79dff', texto: '#f4f2ff' },
  { id: 'oceano', nombre: 'Océano', fondo1: '#071a2e', fondo2: '#0b4a75', acento: '#4cc9f0', texto: '#e6f4ff' },
  { id: 'bosque', nombre: 'Bosque', fondo1: '#0c1f17', fondo2: '#175a3a', acento: '#5fdc8f', texto: '#e6f7ec' },
  { id: 'neon', nombre: 'Neón', fondo1: '#0b0616', fondo2: '#4a0b6b', acento: '#ff3df2', texto: '#fdf4ff' },
  { id: 'cafe', nombre: 'Café', fondo1: '#1e1410', fondo2: '#5a3320', acento: '#f0a35e', texto: '#f7ebe0' },
  { id: 'sakura', nombre: 'Sakura', fondo1: '#fff0f6', fondo2: '#ffc9e3', acento: '#c2185b', texto: '#4a1230' },
  { id: 'menta', nombre: 'Menta', fondo1: '#e8fbf3', fondo2: '#b9f0dc', acento: '#0b8a68', texto: '#0f3b30' },
  { id: 'atardecer', nombre: 'Atardecer', fondo1: '#fff1e2', fondo2: '#ffc7a8', acento: '#d9481f', texto: '#4a2210' },
  { id: 'lavanda', nombre: 'Lavanda', fondo1: '#f1ecff', fondo2: '#d8c8ff', acento: '#6c3ef0', texto: '#2e1f5c' },
  { id: 'cielo', nombre: 'Cielo', fondo1: '#e6f4ff', fondo2: '#b8dcff', acento: '#0f63e0', texto: '#0f2d52' }
];
