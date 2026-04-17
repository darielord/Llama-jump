// ==========================================
// 1. CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
// (Aquí van tus const y let...)
const tigre = document.getElementById("tigre");
const obstaculoArriba = document.getElementById("obstaculo-arriba");
const obstaculoAbajo = document.getElementById("obstaculo-abajo");
const coronadas = document.getElementById("puntos");
const gameOver = document.getElementById("gameover-popup");
const btnOver = document.getElementById("btn-reiniciar");
const puntuacion = document.getElementById("puntuacion-final");
const record = document.getElementById("record-final");
const paisaje = document.getElementById("juego-contenedor");
const monedas = document.getElementById("monedas");
const sonidoSalto = new Audio("jump.WAV");
const contenedorItems = document.getElementById("contenedor-items");
const volverMenu = document.getElementById("btn-volver-menu");

const sonidoChoque = new Audio("hitHurt.WAV");
const sonidoRacha = new Audio("powerUp.WAV");
const sonidoPunto = new Audio("pickupCoin.WAV");
const sonidoMoneda = new Audio("Coin.WAV");

const menu = document.getElementById("menu-inicio");
const tienda = document.getElementById("menu-tienda");
const btnInicio = document.getElementById("btn-empezar");
const btnTienda = document.getElementById("btn-tienda");
const btnTiendaVolver = document.getElementById("volver-tienda");

const catalogo = [
  { id: 1, nombre: "Piel Tigre Clasica", precio: 0, estilo: "tigre" },
  { id: 2, nombre: "Piel Tigre Rosa", precio: 10, estilo: "tigre-rosa" },
  { id: 3, nombre: "Piel Tigre Azul", precio: 10, estilo: "tigre-azul" },
  { id: 4, nombre: "Piel Tigre Verde", precio: 10, estilo: "tigre-verde" },
  { id: 5, nombre: "Piel Tigre Morado", precio: 24, estilo: "tigre-morado" },
];

const skinsCompradas = JSON.parse(localStorage.getItem("skinsCompradas")) || [
  "tigre",
];

let skinEquipada = localStorage.getItem("skinActual") || "tigre";

let tigreY = 0;
let velocidadY = 0;
let gravedad = 1;
let obstaculoX = window.innerWidth;
let velocidadObstaculo = 5;
let llamadasCoronadas = 0;
let juegoActivo = false;
let recordActual = parseInt(localStorage.getItem("mejorRacha") || 0);
let modoFuego = false;
let timerFuego = false;
let velocidadBase = 5;
let fondoX = 0;
let velocidadFondo = 1;
let monedasTotales = parseInt(localStorage.getItem("bolsillo") || 0);
monedas.textContent = `x ${monedasTotales}`;
let monedaActual = null;
let nuevaAlturaAbajo;
let nuevaAlturaArriba;
let monedaX = window.innerWidth;
const alturaMinima = window.innerHeight * 0.15;

const espacioVariable = window.innerHeight * 0.25;

// ==========================================
// 2. TIENDA Y SISTEMA DE SKINS
// ==========================================
// (Aquí va dibujarTienda, comprar, etc.)

function equiparSkin(estilo) {
  skinEquipada = estilo;
  sincronizar();
  actualizacionSkin();
  dibujarTienda();
}

function actualizacionSkin() {
  tigre.className = skinEquipada;
}

function dibujarTienda() {
  let htmlTienda = "";

  document.getElementById("saldo-tienda").textContent = `x ${monedasTotales}`;

  catalogo.forEach((item) => {
    let textoBoton = "";
    let accionClick = "";

    if (skinsCompradas.includes(item.estilo)) {
      textoBoton = skinEquipada === item.estilo ? "PUESTA" : "EQUIPAR";
      accionClick = ` equiparSkin('${item.estilo}')`;
    } else {
      textoBoton = `COMPRAR - ${item.precio}`;
      accionClick = ` comprarSkin(${item.id})`;
    }
    let estadoBoton = "";
    if (
      skinsCompradas.includes(item.estilo) === false &&
      monedasTotales < item.precio
    ) {
      estadoBoton = "disabled";
    }
    htmlTienda += `
     <div class="item-skin">
     <div class='mini-llama-preview ${item.estilo}'></div>
     <p>${item.nombre}</p>
     <button ${estadoBoton}  onclick="${accionClick}">${textoBoton}</button>
     </div>
     `;
  });
  contenedorItems.innerHTML = htmlTienda;
}

function comprarSkin(id) {
  const item = catalogo.find((skin) => skin.id === id);
  if (monedasTotales >= item.precio) {
    monedasTotales -= item.precio;
    monedas.textContent = `x ${monedasTotales}`;
    skinsCompradas.push(item.estilo);
    equiparSkin(item.estilo);
    sincronizar();
    reproducir(sonidoMoneda);
    dibujarTienda();
  }
}

function crearMoneda() {
  if (monedaActual) {
    monedaActual.remove();
  }

  if (Math.random() < 0.5) {
    const monedin = document.createElement("div");
    monedaActual = monedin;
    paisaje.appendChild(monedin);
    monedin.style.left = `${monedaX}px`;
    monedin.style.bottom = `${nuevaAlturaAbajo + nuevaAlturaArriba / 2}px`;

    monedin.classList.add("monedas");
  }
}

// ==========================================
// 3. FUNCIONES DE UTILIDAD (Helper Functions)
// ==========================================
// (Aquí van reproducir, sincronizar y cualquier ayuda extra)

function sincronizar() {
  localStorage.setItem("skinActual", skinEquipada);

  localStorage.setItem("skinsCompradas", JSON.stringify(skinsCompradas));
  localStorage.setItem("mejorRacha", recordActual);

  localStorage.setItem("bolsillo", monedasTotales);
}

function reproducir(audio) {
  audio.currentTime = 0;
  audio.play();
}

function resetearPosicionObstaculos() {
  nuevaAlturaArriba =
    Math.floor(Math.random() * espacioVariable) + alturaMinima;
  nuevaAlturaAbajo = Math.floor(Math.random() * espacioVariable) + alturaMinima;
  crearMoneda();
  obstaculoArriba.style.height = `${nuevaAlturaArriba}px`;
  obstaculoAbajo.style.height = `${nuevaAlturaAbajo}px`;
}

function terminarPartida() {
  juegoActivo = false;
  reproducir(sonidoChoque);
  if (llamadasCoronadas > recordActual) {
    recordActual = llamadasCoronadas;
    sincronizar();
  }
  record.textContent = recordActual;
  puntuacion.textContent = llamadasCoronadas;
  gameOver.style.display = "block";
}

// ==========================================
// 4. MOTOR PRINCIPAL Y LÓGICA DE VUELO
// ==========================================
// (Aquí va el motorJuego...)

function motorJuego() {
  if (!juegoActivo) return;

  obstaculoX = obstaculoX - velocidadObstaculo;
  monedaX = monedaX - velocidadObstaculo;

  fondoX = fondoX - velocidadFondo;

  if (monedaActual) {
    monedaActual.style.left = `${monedaX}px`;
    if (monedaX <= -50) {
      monedaActual.remove();
      monedaActual = null;
    }
  }
  paisaje.style.backgroundPositionX = `${fondoX}px`;

  obstaculoArriba.style.left = `${obstaculoX}px`;

  obstaculoAbajo.style.left = `${obstaculoX}px`;
  velocidadY = velocidadY - gravedad;
  tigreY += velocidadY;

  if (obstaculoX < -30) {
    coronadas.classList.add("puntos-animacion");

    setTimeout(() => {
      coronadas.classList.remove("puntos-animacion");
    }, 200);
    obstaculoX = window.innerWidth;
    monedaX = window.innerWidth;

    llamadasCoronadas += 1;
    crearIndicadorPunto();

    if (llamadasCoronadas % 25 === 0 && llamadasCoronadas > 0) {
      modoFuego = true;
      tigre.classList.add("racha-fuego");
      reproducir(sonidoRacha);
      velocidadObstaculo += 2;
      velocidadFondo += 2;
      timerFuego = setTimeout(() => {
        tigre.classList.remove("racha-fuego");
        velocidadObstaculo = velocidadBase;
        velocidadFondo = 1;
        modoFuego = false;
      }, 7000);
    }

    resetearPosicionObstaculos();

    if (llamadasCoronadas % 20 === 0) {
      velocidadBase += 1;

      if (!modoFuego) {
        velocidadObstaculo = velocidadBase;
      }
    }
    coronadas.textContent = llamadasCoronadas;
  }
  if (tigreY <= 0) {
    tigreY = 0;
    velocidadY = 0;
  }
  if (tigreY >= window.innerHeight - 60) {
    terminarPartida();
  }

  tigre.style.bottom = `${tigreY}px`;
  const angulo = velocidadY * -1;
  tigre.style.transform = `rotate(${angulo}deg) `;

  const tigreCaja = tigre.getBoundingClientRect();
  const obstaculoCajaAbajo = obstaculoAbajo.getBoundingClientRect();
  const obstaculoCajaArriba = obstaculoArriba.getBoundingClientRect();

  if (
    (tigreCaja.right > obstaculoCajaAbajo.left &&
      tigreCaja.left < obstaculoCajaAbajo.right &&
      tigreCaja.bottom > obstaculoCajaAbajo.top &&
      tigreCaja.top < obstaculoCajaAbajo.bottom) ||
    (tigreCaja.right > obstaculoCajaArriba.left &&
      tigreCaja.left < obstaculoCajaArriba.right &&
      tigreCaja.bottom > obstaculoCajaArriba.top &&
      tigreCaja.top < obstaculoCajaArriba.bottom)
  ) {
    terminarPartida();
  }
  if (monedaActual) {
    const monedaCaja = monedaActual.getBoundingClientRect();
    if (
      tigreCaja.right > monedaCaja.left &&
      tigreCaja.left < monedaCaja.right &&
      tigreCaja.bottom > monedaCaja.top &&
      tigreCaja.top < monedaCaja.bottom
    ) {
      monedasTotales += 1;

      sincronizar();
      monedas.textContent = `x ${monedasTotales}`;
      monedaActual.remove();
      monedaActual = null;
      reproducir(sonidoMoneda);
    }
  }

  if (juegoActivo === true) {
    requestAnimationFrame(motorJuego);
  }
}

document.addEventListener("click", () => {
  if (juegoActivo === false) return;
  velocidadY = 15;
  reproducir(sonidoSalto);
});

function reiniciarNivel() {
  tigreY = 0;
  velocidadY = 0;
  obstaculoX = window.innerWidth;
  llamadasCoronadas = 0;
  coronadas.textContent = llamadasCoronadas;
  velocidadObstaculo = 5;
  velocidadBase = 5;
  fondoX = 0;
  monedaX = window.innerWidth;
  tigre.style.bottom = "0px";

  tigre.classList.remove("racha-fuego");
  clearTimeout(timerFuego);

  resetearPosicionObstaculos();
  juegoActivo = false;

  if (monedaActual) {
    monedaActual.remove();
    monedaActual = null;
  }
  document.querySelectorAll(".punto-flotante").forEach((el) => el.remove());
}
btnOver.addEventListener("click", () => {
  gameOver.style.display = "none";
  reiniciarNivel();
  juegoActivo = true;
  motorJuego();
});

volverMenu.addEventListener("click", () => {
  gameOver.style.display = "none";

  menu.style.display = "flex";
  reiniciarNivel();
});

btnInicio.addEventListener("click", () => {
  menu.style.display = "none";

  juegoActivo = true;
  motorJuego();
});

btnTienda.addEventListener("click", () => {
  menu.style.display = "none";
  tienda.style.display = "block";
  dibujarTienda();
});

btnTiendaVolver.addEventListener("click", () => {
  tienda.style.display = "none";
  menu.style.display = "flex";
});

function crearIndicadorPunto() {
  const el = document.createElement("div");

  el.classList.add("punto-flotante");

  el.style.left = tigre.offsetLeft + "px";
  el.style.bottom = tigreY + 60 + "px";

  el.textContent = "+1";
  paisaje.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 800);

  reproducir(sonidoPunto);
}
actualizacionSkin();
