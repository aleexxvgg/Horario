// Conecta los botones con el resto del código y arranca la aplicación.

// ---------- Título y curso (se pueden editar) ----------

function activarTextoEditable() {
  [['title', CLAVES.titulo], ['course', CLAVES.curso]].forEach(([id, clave]) => {
    porId(id).addEventListener('input', () => guardar(clave, porId(id).textContent));
  });
}

// ---------- Paneles laterales ----------

const PANELES = [
  { panel: 'drawer', abrir: 'open', cerrar: 'close' },
  { panel: 'exdrawer', abrir: 'exopen', cerrar: 'exclose' },
  { panel: 'cdrawer', abrir: 'calopen', cerrar: 'calclose' }
];

function panelAbierto() {
  return document.querySelector('aside.open');
}

function cambiarPanel(idPanel, idBoton, abrir) {
  const panel = porId(idPanel);
  const boton = porId(idBoton);

  panel.classList.toggle('open', abrir);
  porId('scrim').classList.toggle('on', abrir);
  boton.setAttribute('aria-expanded', abrir);

  if (abrir) {
    panel.removeAttribute('inert');
    setTimeout(() => panel.querySelector('.x').focus(), 50);
  } else {
    panel.setAttribute('inert', '');
    boton.focus();
  }
}

function cerrarPaneles() {
  PANELES.forEach(({ panel, abrir }) => {
    if (porId(panel).classList.contains('open')) cambiarPanel(panel, abrir, false);
  });
}

// Con Tab el foco se queda dentro del panel abierto
function mantenerFocoEnPanel(evento, panel) {
  const elementos = [...panel.querySelectorAll('button:not([hidden]),select,input')].filter((e) => e.offsetParent);
  const primero = elementos[0];
  const ultimo = elementos[elementos.length - 1];

  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

function activarPaneles() {
  PANELES.forEach(({ panel, abrir, cerrar }) => {
    porId(abrir).addEventListener('click', () => cambiarPanel(panel, abrir, true));
    porId(cerrar).addEventListener('click', cerrarPaneles);
  });
  porId('scrim').addEventListener('click', cerrarPaneles);

  document.addEventListener('keydown', (evento) => {
    const panel = panelAbierto();
    if (!panel) return;
    if (evento.key === 'Escape') cerrarPaneles();
    if (evento.key === 'Tab') mantenerFocoEnPanel(evento, panel);
  });
}

// ---------- Menús de Moodle y Classroom ----------

function cerrarMenusDeEnlaces() {
  document.querySelectorAll('.dd').forEach((menu) => {
    menu.querySelector('.ddp').hidden = true;
    menu.querySelector('.lb').setAttribute('aria-expanded', 'false');
  });
}

function activarMenusDeEnlaces() {
  document.querySelectorAll('.dd .lb').forEach((boton) => {
    boton.addEventListener('click', () => {
      const panel = boton.nextElementSibling;
      const abrir = panel.hidden;
      cerrarMenusDeEnlaces();
      panel.hidden = !abrir;
      boton.setAttribute('aria-expanded', abrir);
    });
  });

  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('.dd')) cerrarMenusDeEnlaces();
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    const abierto = document.querySelector('.ddp:not([hidden])');
    if (!abierto) return;
    const boton = abierto.previousElementSibling;
    cerrarMenusDeEnlaces();
    boton.focus();
  });
}

// ---------- Horario ----------

function activarHorario() {
  porId('grid').addEventListener('click', (evento) => {
    const celda = evento.target.closest('.c');
    if (celda) abrirMenuAsignatura(horario[Number(celda.dataset.d)][Number(celda.dataset.i)]);
  });

  porId('tabs').addEventListener('click', (evento) => {
    const pestana = evento.target.closest('.tab');
    if (!pestana) return;
    diaSeleccionado = Number(pestana.dataset.i);
    dibujarHorario();
  });

  porId('status').addEventListener('click', (evento) => {
    if (evento.target.id !== 'clr') return;
    filtro = {};
    dibujarTodo();
  });
}

// ---------- Profesores ----------

function activarProfesores() {
  porId('list').addEventListener('click', (evento) => {
    const botonAsignatura = evento.target.closest('.sb');
    const botonProfesor = evento.target.closest('.tb');

    if (botonAsignatura) {
      const { t: profesor, k: asignatura } = botonAsignatura.dataset;
      const yaMarcada = filtro.profesor === profesor && filtro.asignatura === asignatura;
      filtro = yaMarcada ? { profesor } : { profesor, asignatura };
    } else if (botonProfesor) {
      const profesor = botonProfesor.dataset.t;
      filtro = filtro.profesor === profesor ? {} : { profesor };
    } else {
      return;
    }

    dibujarTodo();

    // Al redibujar la lista se pierde el foco, así que se devuelve al mismo botón
    const seleccionado = botonAsignatura
      ? document.querySelector(`.sb[data-k="${botonAsignatura.dataset.k}"][data-t="${botonAsignatura.dataset.t}"]`)
      : document.querySelector(`.tb[data-t="${botonProfesor.dataset.t}"]`);
    if (seleccionado) seleccionado.focus();
  });

  porId('all').addEventListener('click', () => {
    filtro = {};
    dibujarTodo();
  });
}

// ---------- Exámenes ----------

function activarExamenes() {
  porId('exk').innerHTML = Object.entries(ASIGNATURAS)
    .map(([clave, a]) => `<option value="${clave}" style="background:hsl(${a.tono} 55% 24%);color:#fff">${a.emoji} ${a.nombre}</option>`)
    .join('');
  porId('exd').min = textoDesdeFecha(hoy());

  porId('exadd').addEventListener('click', () => {
    const fecha = porId('exd').value;
    if (!fecha) {
      porId('exmsg').textContent = 'Elige primero el día del examen.';
      return;
    }

    examenes.push({
      id: Date.now() + Math.random().toString(36).slice(2, 6),
      asignatura: porId('exk').value,
      fecha,
      nota: porId('exn').value.trim()
    });
    guardarExamenes();

    porId('exmsg').textContent = 'Examen añadido.';
    porId('exd').value = '';
    porId('exn').value = '';
    dibujarTodo();
  });

  porId('exlist').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.del');
    if (!boton) return;
    examenes = examenes.filter((examen) => String(examen.id) !== boton.dataset.id);
    guardarExamenes();
    porId('exmsg').textContent = 'Examen borrado.';
    dibujarTodo();
  });
}

// ---------- Calendario ----------

function activarCalendario() {
  porId('cprev').addEventListener('click', () => {
    mesDelCalendario = new Date(mesDelCalendario.getFullYear(), mesDelCalendario.getMonth() - 1, 1);
    dibujarCalendario();
  });

  porId('cnext').addEventListener('click', () => {
    mesDelCalendario = new Date(mesDelCalendario.getFullYear(), mesDelCalendario.getMonth() + 1, 1);
    dibujarCalendario();
  });

  // Pulsar el nombre del mes vuelve a hoy
  porId('cmt').addEventListener('click', () => {
    mesDelCalendario = new Date(hoy().getFullYear(), hoy().getMonth(), 1);
    diaDelCalendario = textoDesdeFecha(hoy());
    dibujarCalendario();
  });

  porId('cgrid').addEventListener('click', (evento) => {
    const dia = evento.target.closest('.cdb');
    if (!dia) return;
    diaDelCalendario = dia.dataset.k;
    dibujarCalendario();
    document.querySelector(`.cdb[data-k="${diaDelCalendario}"]`)?.focus();
  });
}

// ---------- Ficha de la asignatura y edición de clases ----------

function activarFicha() {
  const ficha = porId('info');
  const dialogoEditar = porId('dlg');

  porId('iclose').addEventListener('click', () => ficha.close());
  ficha.addEventListener('click', (evento) => {
    if (evento.target === ficha) ficha.close();
  });

  porId('ifilter').addEventListener('click', () => {
    filtro = { asignatura: claseElegida.asignatura };
    ficha.close();
    dibujarTodo();
  });

  porId('iedit').addEventListener('click', () => {
    ficha.close();
    porId('sel').value = claseElegida.asignatura;
    porId('teach').value = claseElegida.profesor;
    porId('room').value = claseElegida.aula;
    dialogoEditar.showModal();
  });

  porId('sel').innerHTML = Object.entries(ASIGNATURAS)
    .map(([clave, a]) => `<option value="${clave}" style="background:hsl(${a.tono} 55% 24%);color:#fff">${a.nombre}</option>`)
    .join('');

  porId('save').addEventListener('click', () => {
    claseElegida.asignatura = porId('sel').value;
    claseElegida.profesor = porId('teach').value.trim();
    claseElegida.aula = porId('room').value.trim();
    guardarHorario();
    dialogoEditar.close();
    dibujarTodo();
  });

  porId('cancel').addEventListener('click', () => dialogoEditar.close());
}

// ---------- Ajustes: letra, contraste, estilo futurista y temas ----------

function activarAjustes() {
  porId('fsm').addEventListener('click', () => {
    tamanoLetra = Math.max(0, tamanoLetra - 1);
    guardar(CLAVES.tamanoLetra, tamanoLetra);
    aplicarPreferencias();
  });

  porId('fsp').addEventListener('click', () => {
    tamanoLetra = Math.min(2, tamanoLetra + 1);
    guardar(CLAVES.tamanoLetra, tamanoLetra);
    aplicarPreferencias();
  });

  porId('hc').addEventListener('click', () => {
    altoContraste = !altoContraste;
    guardar(CLAVES.contraste, altoContraste ? 1 : 0);
    aplicarPreferencias();
  });

  porId('fx').addEventListener('click', () => {
    estiloFuturista = !estiloFuturista;
    guardar(CLAVES.futurista, estiloFuturista ? 1 : 0);
    aplicarPreferencias();
  });

  const dialogoTemas = porId('thm');
  porId('themeopen').addEventListener('click', () => {
    dibujarTemas();
    dialogoTemas.showModal();
  });
  porId('tclose').addEventListener('click', () => dialogoTemas.close());
  dialogoTemas.addEventListener('click', (evento) => {
    if (evento.target === dialogoTemas) dialogoTemas.close();
  });

  porId('tg').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.tt');
    if (!boton) return;
    const tema = boton.dataset.t;
    if (tema === 'auto') {
      delete raiz.dataset.theme;
    } else {
      raiz.dataset.theme = tema;
    }
    guardar(CLAVES.tema, tema);
    dibujarTemas();
  });
}

// ---------- Reloj de la cabecera (estilo futurista) ----------

function actualizarReloj() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-ES');
  const fecha = ahora.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  porId('hud').textContent = `SYS//${hora} · ${fecha.toUpperCase()}`;
}

// ---------- Arranque ----------

cargarDatosGuardados();
cargarPreferencias();

activarTextoEditable();
activarPaneles();
activarMenusDeEnlaces();
activarHorario();
activarProfesores();
activarExamenes();
activarCalendario();
activarFicha();
activarAjustes();

actualizarReloj();
setInterval(actualizarReloj, 1000);

aplicarPreferencias();
dibujarTodo();

// Cada minuto se actualiza qué clase está en curso
setInterval(() => {
  dibujarHorario();
  dibujarTarjetaAhora();
}, 60000);
