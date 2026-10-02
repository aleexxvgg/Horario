// Funciones que dibujan la página a partir de los datos.

// Variables CSS que usa cada elemento para tener el color y la letra de su asignatura
function estiloDe(asignatura) {
  return `--tono:${asignatura.tono};--fuente:${asignatura.fuente};--escala:${asignatura.escala}`;
}

function aplicarPreferencias() {
  raiz.style.setProperty('--tamano-letra', [100, 115, 130][tamanoLetra] + '%');
  raiz.dataset.hc = altoContraste ? 1 : 0;
  raiz.dataset.fx = estiloFuturista ? 1 : 0;
  porId('fx').setAttribute('aria-pressed', String(estiloFuturista));
  porId('hc').setAttribute('aria-pressed', String(altoContraste));
}

// ---------- Tarjeta "Ahora / Siguiente clase" ----------

function dibujarTarjetaAhora() {
  const tarjeta = porId('next');
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  // Se busca la clase en curso o la siguiente, hoy o en los próximos días
  for (let sumaDias = 0; sumaDias < 8; sumaDias++) {
    const fecha = new Date(ahora.getTime() + sumaDias * MS_POR_DIA);
    const dia = fecha.getDay() - 1;
    if (dia < 0 || dia > 4) continue;

    const clasesDelDia = [...horario[dia]].sort((a, b) => a.inicio - b.inicio);
    for (const clase of clasesDelDia) {
      const empieza = aMinutos(HORAS[clase.inicio].inicio);
      const termina = aMinutos(horaFin(clase));
      if (sumaDias === 0 && termina <= minutosAhora) continue;   // ya ha pasado

      const enCurso = sumaDias === 0 && empieza <= minutosAhora;
      const asignatura = asignaturaDe(clase.asignatura);
      let cuando;
      if (enCurso) cuando = `hasta las ${horaFin(clase)}`;
      else if (sumaDias === 0) cuando = `hoy a las ${HORAS[clase.inicio].inicio}`;
      else if (sumaDias === 1) cuando = `mañana a las ${HORAS[clase.inicio].inicio}`;
      else cuando = `el ${DIAS[dia].toLowerCase()} a las ${HORAS[clase.inicio].inicio}`;

      const progreso = Math.min(100, Math.round((minutosAhora - empieza) / (termina - empieza) * 100));
      const barra = enCurso ? `<i class="pg" style="--progreso:${progreso}%"></i>` : '';

      tarjeta.style.setProperty('--tono', asignatura.tono);
      tarjeta.style.setProperty('--fuente', asignatura.fuente);
      tarjeta.style.setProperty('--escala', asignatura.escala);
      tarjeta.innerHTML = `
        <div class="ic" aria-hidden="true">${asignatura.emoji}</div>
        <div>
          <small>${enCurso ? 'Ahora en clase' : 'Siguiente clase'} · ${cuando}</small>
          <strong>${asignatura.nombre}</strong>
          <small>${escapar(clase.profesor)} · Aula ${escapar(clase.aula)}</small>
        </div>
        ${barra}`;
      return;
    }
  }
  tarjeta.innerHTML = '<strong>No hay más clases próximas</strong>';
}

// ---------- Horario semanal ----------

function celdaDeClase(clase, dia, posicion, horaAhora) {
  const asignatura = asignaturaDe(clase.asignatura);
  const horaInicio = HORAS[clase.inicio].inicio;
  const examen = hayExamen(clase.asignatura, dia);
  const esAhora = dia === diaDeHoy && horaAhora >= clase.inicio && horaAhora < clase.inicio + clase.horas;

  const clases = ['c'];
  if (esAhora) clases.push('now');
  if (hayFiltro()) clases.push(coincideConFiltro(clase) ? 'hit' : 'dim');

  let descripcion = `${DIAS[dia]}, de ${horaInicio} a ${horaFin(clase)}: ${asignatura.nombre}, ${clase.profesor}, aula ${clase.aula}`;
  if (hayFiltro() && coincideConFiltro(clase)) descripcion += '. Marcada.';
  if (examen) descripcion += '. Hay examen este día.';

  const posicionEnLaTabla = `--fila:${filaDeLaHora(clase.inicio)} / span ${clase.horas};--columna:${dia + 2};--horas:${clase.horas}`;

  return `
    <button type="button" class="${clases.join(' ')}" data-d="${dia}" data-i="${posicion}"
      aria-label="${escapar(descripcion)}"
      style="${estiloDe(asignatura)};${posicionEnLaTabla}">
      <span class="tm">${horaInicio} – ${horaFin(clase)}</span>
      <span class="ic" aria-hidden="true">${asignatura.emoji}</span>
      <strong>${asignatura.nombre}</strong>
      ${examen ? '<em class="exb">📝 Examen</em>' : ''}
      <span>${escapar(clase.profesor)} · ${escapar(clase.aula)}</span>
    </button>`;
}

function dibujarHorario() {
  const horaAhora = horaEnCurso();
  let html = '';

  // Cabecera con los días (la columna 1 es la de las horas)
  DIAS.forEach((nombre, dia) => {
    const esHoy = dia === diaDeHoy ? ' today' : '';
    html += `<div class="h${esHoy}" style="grid-row:1;grid-column:${dia + 2}">${nombre}</div>`;
  });

  // Una fila por cada hora, con las clases que empiezan en ella
  HORAS.forEach((hora, indice) => {
    if (indice === RECREO_ANTES_DE) {
      html += '<div class="r">☕ Recreo · 10:20 – 10:40</div>';
    }
    html += `<div class="t" style="grid-row:${filaDeLaHora(indice)};grid-column:1"><b>${hora.inicio}</b>${hora.fin}</div>`;

    horario.forEach((clasesDelDia, dia) => {
      clasesDelDia.forEach((clase, posicion) => {
        if (clase.inicio === indice) {
          html += celdaDeClase(clase, dia, posicion, horaAhora);
        }
      });
    });
  });

  porId('grid').innerHTML = html;
  porId('grid').dataset.sel = diaSeleccionado;

  // Pestañas de los días (solo se ven en el móvil)
  porId('tabs').innerHTML = DIAS.map((nombre, dia) => {
    const clases = ['tab'];
    if (dia === diaDeHoy) clases.push('today');
    if (hayFiltro() && horario[dia].some(coincideConFiltro)) clases.push('has');
    return `<button type="button" role="tab" class="${clases.join(' ')}" aria-selected="${dia === diaSeleccionado}" data-i="${dia}">${nombre.slice(0, 3)}</button>`;
  }).join('');
}

// ---------- Barra de estado ----------

function dibujarEstado() {
  const zona = porId('status');

  if (!hayFiltro()) {
    zona.innerHTML = `<span>Esta semana: <b>${contarHoras(() => true)} horas</b> de clase. Abre <b>Profesores</b> para marcar las horas de cada uno.${textoProximoExamen()}</span>`;
    return;
  }

  const etiqueta = [filtro.profesor, filtro.asignatura && asignaturaDe(filtro.asignatura).nombre]
    .filter(Boolean)
    .join(' · ');
  zona.innerHTML = `
    <span>Marcando: <b>${escapar(etiqueta)}</b> · ${contarHoras(coincideConFiltro)} h a la semana</span>
    <button class="pill" type="button" id="clr">Quitar filtro</button>`;
}

// ---------- Panel de profesores ----------

function dibujarProfesores() {
  const coloresAvatar = [250, 20, 160, 330, 50];

  porId('list').innerHTML = listaDeProfesores().map((profesor, posicion) => {
    const abierto = filtro.profesor === profesor;
    const total = contarHoras((c) => c.profesor === profesor);

    // Barritas con las horas que da cada día
    const barras = DIAS_CORTOS.map((letra, dia) => {
      const horas = horario[dia]
        .filter((c) => c.profesor === profesor)
        .reduce((suma, c) => suma + c.horas, 0);
      return `<i><u style="height:${horas * 5}px"></u>${letra}</i>`;
    }).join('');

    // Asignaturas que da este profesor
    const claves = [...new Set(todasLasClases().filter((c) => c.profesor === profesor).map((c) => c.asignatura))];
    const asignaturas = claves.map((clave) => {
      const asignatura = asignaturaDe(clave);
      const horas = contarHoras((c) => c.profesor === profesor && c.asignatura === clave);
      return `
        <button type="button" class="sb" style="${estiloDe(asignatura)}"
          data-t="${escapar(profesor)}" data-k="${clave}" aria-pressed="${abierto && filtro.asignatura === clave}">
          <b aria-hidden="true">${asignatura.emoji}</b>
          <span>${asignatura.nombre}</span>
          ${horas} h
        </button>`;
    }).join('');

    return `
      <div class="tch${abierto ? ' on' : ''}">
        <button type="button" class="tb" data-t="${escapar(profesor)}" aria-expanded="${abierto}"
          aria-label="${escapar(profesor)}, ${total} horas a la semana">
          <span class="av" style="--tono:${coloresAvatar[posicion % coloresAvatar.length]}" aria-hidden="true">${iniciales(profesor)}</span>
          <span class="n"><b>${escapar(profesor)}</b><small>${total} h a la semana</small></span>
          <span class="bars" aria-hidden="true">${barras}</span>
          <span class="chev" aria-hidden="true">▾</span>
        </button>
        <div class="subs" ${abierto ? '' : 'hidden'}>${asignaturas}</div>
      </div>`;
  }).join('');
}

// ---------- Panel de exámenes ----------

function dibujarExamenes() {
  // Primero los que quedan por hacer y al final los que ya han pasado
  const ordenados = [...examenes].sort((a, b) => {
    const pasadoA = diasHasta(a.fecha) < 0;
    const pasadoB = diasHasta(b.fecha) < 0;
    return (pasadoA - pasadoB) || a.fecha.localeCompare(b.fecha);
  });

  if (ordenados.length === 0) {
    porId('exlist').innerHTML = '<li class="empty">Aún no hay exámenes. Añade el primero arriba.</li>';
    return;
  }

  porId('exlist').innerHTML = ordenados.map((examen) => {
    const dias = diasHasta(examen.fecha);
    const fecha = fechaDesdeTexto(examen.fecha);
    const asignatura = asignaturaDe(examen.asignatura);
    const nota = examen.nota ? ' · ' + escapar(examen.nota) : '';
    const cercano = dias >= 0 && dias <= 3;

    return `
      <li class="exc${dias < 0 ? ' past' : ''}" style="${estiloDe(asignatura)}">
        <div class="dt" aria-hidden="true"><b>${fecha.getDate()}</b><small>${MESES_CORTOS[fecha.getMonth()]}</small></div>
        <div class="exi">
          <strong>${asignatura.emoji} ${asignatura.nombre}</strong>
          <small>${fechaLarga(examen.fecha)}${nota}</small>
          <span class="cdn${cercano ? ' soon' : ''}">${textoCuentaAtras(dias)}</span>
        </div>
        <button type="button" class="del" data-id="${examen.id}" aria-label="Borrar examen de ${asignatura.nombre}">🗑</button>
      </li>`;
  }).join('');
}

// ---------- Selector de temas ----------

function dibujarTemas() {
  const temaActual = raiz.dataset.theme || 'auto';
  porId('tg').innerHTML = TEMAS.map((tema) => `
    <button type="button" class="tt" data-t="${tema.id}" aria-pressed="${temaActual === tema.id}"
      style="background:linear-gradient(135deg,${tema.fondo1},${tema.fondo2});color:${tema.texto}">
      <span>${tema.nombre}</span>
      <i style="background:${tema.acento}"></i>
    </button>`).join('');
}

// ---------- Calendario ----------

function dibujarCalendario() {
  const anio = mesDelCalendario.getFullYear();
  const mes = mesDelCalendario.getMonth();
  const huecosAntes = (new Date(anio, mes, 1).getDay() + 6) % 7;      // días en blanco antes del día 1
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const textoHoy = textoDesdeFecha(hoy());

  porId('cmt').textContent = `${MESES[mes]} ${anio}`;

  let html = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((letra) => `<div class="cw" aria-hidden="true">${letra}</div>`).join('');
  html += '<div></div>'.repeat(huecosAntes);

  for (let numero = 1; numero <= diasDelMes; numero++) {
    const fecha = new Date(anio, mes, numero);
    const texto = textoDesdeFecha(fecha);
    const examenesDelDia = examenes.filter((e) => e.fecha === texto);
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;

    const clases = ['cdb'];
    if (texto === textoHoy) clases.push('today');
    if (texto === diaDelCalendario) clases.push('sel');
    if (esFinDeSemana) clases.push('we');

    let descripcion = `${numero} de ${MESES[mes]}`;
    if (examenesDelDia.length > 0) {
      descripcion += `, ${examenesDelDia.length} ${examenesDelDia.length > 1 ? 'exámenes' : 'examen'}`;
    }
    const puntos = examenesDelDia.slice(0, 3)
      .map((e) => `<i style="background:hsl(${asignaturaDe(e.asignatura).tono} 90% 55%)"></i>`)
      .join('');

    html += `
      <button type="button" class="${clases.join(' ')}" data-k="${texto}" aria-pressed="${texto === diaDelCalendario}"
        aria-label="${descripcion}">${numero}<span class="dots">${puntos}</span></button>`;
  }
  porId('cgrid').innerHTML = html;

  dibujarDetalleDelDia();
}

// Clases y exámenes del día que está marcado en el calendario
function dibujarDetalleDelDia() {
  const diaSemana = (fechaDesdeTexto(diaDelCalendario).getDay() + 6) % 7;
  let lista = '';

  if (diaSemana < 5) {
    lista += [...horario[diaSemana]]
      .sort((a, b) => a.inicio - b.inicio)
      .map((clase) => {
        const asignatura = asignaturaDe(clase.asignatura);
        return `
          <li class="ci" style="${estiloDe(asignatura)}">
            <span aria-hidden="true">${asignatura.emoji}</span>
            <div>
              <strong>${asignatura.nombre}</strong>
              <small>${HORAS[clase.inicio].inicio} – ${horaFin(clase)} · ${escapar(clase.profesor)} · ${escapar(clase.aula)}</small>
            </div>
          </li>`;
      }).join('');
  } else {
    lista += '<li class="empty">Fin de semana: sin clases 🎉</li>';
  }

  lista += examenes
    .filter((e) => e.fecha === diaDelCalendario)
    .map((examen) => {
      const asignatura = asignaturaDe(examen.asignatura);
      return `
        <li class="ci exx" style="${estiloDe(asignatura)}">
          <span aria-hidden="true">📝</span>
          <div>
            <strong>Examen de ${asignatura.nombre}</strong>
            <small>${examen.nota ? escapar(examen.nota) : 'Sin nota'}</small>
          </div>
        </li>`;
    }).join('');

  porId('cdet').innerHTML = `<h3>${fechaLarga(diaDelCalendario)}</h3><ul class="exl2">${lista}</ul>`;
}

// ---------- Menú de cada asignatura (mini calendario) ----------

function abrirMenuAsignatura(claseAbierta) {
  claseElegida = claseAbierta;
  const clave = claseAbierta.asignatura;
  const asignatura = asignaturaDe(clave);
  const menu = porId('info');
  const clasesDeLaAsignatura = todasLasClases().filter((c) => c.asignatura === clave);
  const totalHoras = contarHoras((c) => c.asignatura === clave);

  menu.style.setProperty('--tono', asignatura.tono);
  menu.style.setProperty('--fuente', asignatura.fuente);
  menu.style.setProperty('--escala', asignatura.escala);
  porId('ie').textContent = asignatura.emoji;
  porId('it').textContent = asignatura.nombre;
  porId('isub').textContent = [...new Set(clasesDeLaAsignatura.map((c) => c.profesor))].join(' · ');
  porId('itot').textContent = `${totalHoras} ${totalHoras === 1 ? 'hora' : 'horas'} a la semana`;

  // Mini calendario: se ilumina cada hora en la que hay esta asignatura
  let html = '<div></div>' + DIAS_CORTOS.map((letra) => `<div class="d">${letra}</div>`).join('');
  HORAS.forEach((hora, indice) => {
    if (indice === RECREO_ANTES_DE) html += '<div class="rc"></div>';
    html += `<div class="tl">${hora.inicio}</div>`;
    for (let dia = 0; dia < 5; dia++) {
      const claseEnEsaHora = horario[dia].find((c) =>
        c.asignatura === clave && c.inicio <= indice && indice < c.inicio + c.horas
      );
      const clases = ['s'];
      if (claseEnEsaHora) clases.push('on');
      if (claseEnEsaHora === claseAbierta) clases.push('sel');
      html += `<div class="${clases.join(' ')}"></div>`;
    }
  });
  porId('mc').innerHTML = html;

  // Lista con los días y horas
  let lista = '';
  horario.forEach((clasesDelDia, dia) => {
    clasesDelDia.filter((c) => c.asignatura === clave).forEach((c) => {
      lista += `<li><span>${DIAS[dia]}</span><span>${HORAS[c.inicio].inicio} – ${horaFin(c)} · ${c.horas} h · ${escapar(c.aula)}</span></li>`;
    });
  });
  examenes
    .filter((e) => e.asignatura === clave && diasHasta(e.fecha) >= 0)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .forEach((e) => {
      lista += `<li class="exli"><span>📝 Examen</span><span>${fechaLarga(e.fecha)}</span></li>`;
    });
  porId('il').innerHTML = lista;

  menu.showModal();
}

// ---------- Todo junto ----------

function dibujarTodo() {
  dibujarHorario();
  dibujarEstado();
  dibujarProfesores();
  dibujarExamenes();
  dibujarCalendario();
  dibujarTarjetaAhora();
}
