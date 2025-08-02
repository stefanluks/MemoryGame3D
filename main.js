import * as THREE from 'three';
import { menu, jogo } from "./public/componentes/telas-config.js";
import Carta from "./public/componentes/Carta.js";

export const GAME = {
    tela: "menu",
    telas: [],
    lista: [],
    intro: true,
    pontos: 0,
    tempo: 3000,
    maxTime: 3000,
    gameOver: false,
    getTela: () => {
        let tela = GAME.telas.find(t => t.nome == GAME.tela);
        return tela.cena;
    },
    cam: {
        fov: 45,
        y: 0,
        obj: null,

    },
    frames: 0,
    viradas: [],
    verificacao: () => {
        let carta1 = GAME.viradas[0];
        let carta2 = GAME.viradas[1];
        if (carta1.codigo === carta2.codigo) {
            carta1.bloqueado = true;
            carta2.bloqueado = true;
            GAME.viradas = [];
            GAME.pontos++;
            GAME.tempo += 100;
        } else {
            carta1.clicado();
            carta2.clicado();
            GAME.viradas = [];
        }
        // Checa se todas as cartas estão bloqueadas (todos os pares feitos)
        if (GAME.lista.every(carta => carta.bloqueado)) {
            setTimeout(resetarCartas, 1000); // Espera um pouco antes de resetar
        }
    },
    // Função para resetar cartas após todos os pares
    resetarCartas: () => {
        if(GAME.tempo < (GAME.maxTime - 500)) GAME.tempo += 500;
        else if(GAME.tempo < GAME.maxTime) GAME.tempo += (GAME.maxTime - GAME.tempo);
        GAME.intro = true;
        // Desbloqueia e desvira todas as cartas, move para o centro
        GAME.lista.forEach(carta => {
            carta.bloqueado = false;
            carta.clicado(); // desvira se estiver virada
            carta.SetPosFinal(0, 0);
        });
        // Após animação para o centro, sorteia e redistribui
        setTimeout(() => {
            GAME.SortearBaralho();
            GAME.lista.forEach((carta, index) => {
                if (index < 5) {
                    let posFinalX = (index - 2) * 1.2;
                    carta.SetPosFinal(posFinalX, 0.7);
                } else {
                    let posFinalX = (index - 7) * 1.2;
                    carta.SetPosFinal(posFinalX, -0.7);
                }
            });
        }, 1200); // tempo suficiente para todas chegarem ao centro
    },
    SortearBaralho: () => {
        let lista = GAME.lista;
        let final = [];
        let nuns = [];
        while (final.length < lista.length) {
            let num = Math.floor(Math.random() * lista.length);
            if (nuns.indexOf(num) == -1) {
                nuns.push(num);
                final.push(lista[num]);
            }
        }
        GAME.lista = final;
    },
    baralhoVirado: () => {
        let resp = true;
        GAME.lista.forEach(item => {if(!item.bloqueado) resp = false;});
        return resp;
    },
    getTempo: () => {
        let percent = (GAME.tempo/GAME.maxTime) * 100;
        // console.log(GAME.tempo, div, percent)
        return percent.toFixed(0);
    },
    getSegundos: () => {
        return (GAME.tempo / 1000).toFixed(1);
    },
    GameOver: () => {
        if(!GAME.gameOver){
            let GOhtml = document.createElement("div");
            GOhtml.id = "game-over";
            GOhtml.innerHTML = `<h3>Game Over</h3><p>Total de pontos: ${GAME.pontos}</p>`;
            let btnReset = document.createElement("div");
            btnReset.className = "btn-reset";
            btnReset.textContent = "Reiniciar";
            btnReset.addEventListener("click", () => window.location.reload());
            GOhtml.appendChild(btnReset);
            document.body.appendChild(GOhtml);
            GAME.gameOver = true;
        }
    }
}

const textureLoader = new THREE.TextureLoader();

GAME.telas.push(menu);
GAME.telas.push(jogo);
GAME.cam.obj = new THREE.PerspectiveCamera(GAME.cam.fov, window.innerWidth / window.innerHeight, 1, 500);
GAME.cam.obj.lookAt(0, 0, 0);
GAME.cam.obj.position.set(0, 0, 100);

function BuscarCartas() {
    let url = window.location.href;
    fetch(url + "public/config/cartas.json")
        .then(data => data.json())
        .then(resp => {
            resp.forEach((nome, index) => {
                GAME.lista.push(new Carta(nome, index, "c-" + index));
                GAME.lista.push(new Carta(nome, index + 5, "c-" + index));
            });
            GAME.SortearBaralho();
            Start();
        })
}

function ResetScene() {
    GAME.cam.obj = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    GAME.cam.obj.lookAt(0, 0, 0);
    GAME.cam.obj.position.set(0, 0, 100);
}

function Start() {
    GAME.lista.forEach((carta, index) => {
        if (index < 5) {
            let posFinalX = (index - 2) * 1.2;
            // carta.objeto.position.y = 0.7;
            carta.SetPosFinal(posFinalX, 0.7);
        } else {
            let posFinalX = (index - 7) * 1.2;
            // carta.objeto.position.y = -0.7;
            carta.SetPosFinal(posFinalX, -0.7);
        }
        jogo.AddObjeto(carta.getObjeto())
    });
    // jogo.AddObjeto(GAME.lista[0].getObjeto()); //LINHA DE TESTES
}

GAME.cam.obj.position.z = 4;

function animate() {
    GAME.frames++;
    if (GAME.tela == "jogo" && GAME.frames % 2 == 0) {
        let todasParadas = true;
        GAME.tempo -= 1;
        GAME.lista.forEach(carta => {
            carta.Atualizar();
            if (carta.intro) todasParadas = false;
        });
        // Libera clique quando todas as cartas terminarem a animação de introdução
        if (GAME.intro && todasParadas) {
            GAME.intro = false;
        }
    }
    if(GAME.tempo <= 0) GAME.GameOver();
    else{
        document.getElementById("pontos").textContent = GAME.pontos;
        document.getElementById("tempo").style.width = GAME.getTempo()+"%";
        document.getElementById("tempo-numero").textContent = GAME.getSegundos()+"s";
    }
    if(GAME.baralhoVirado()) GAME.resetarCartas();
    renderer.render(GAME.getTela(), GAME.cam.obj);
}

// --- Raycaster e detecção de clique ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


function onMouseClick(event) {
    // Normaliza coordenadas do mouse (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, GAME.cam.obj);

    // Clique no botão do menu
    const menuIntersects = raycaster.intersectObjects([GAME.telas[0].getBtn("btn")]);
    if (menuIntersects.length > 0) {       
        if (menuIntersects[0].object.name == "btn") {
            GAME.tela = "jogo";
            document.getElementById("titulo").remove();
        }
        return;
    }

    // Clique nas cartas só quando estiver no jogo e não na intro
    if (GAME.tela === "jogo" && !GAME.intro) {
        // Use apenas objetos presentes na cena do jogo
        const objetosCartas = jogo.cena.children.filter(obj => obj.type === 'Mesh');
        const intersects = raycaster.intersectObjects(objetosCartas);
        if (intersects.length > 0 && GAME.viradas.length < 2) {
            const cartaClicada = GAME.lista.find(carta => carta.getObjeto() === intersects[0].object);
            if (cartaClicada) {
                cartaClicada.clicado();
                if (!cartaClicada.bloqueado) GAME.viradas.push(cartaClicada);
                if (GAME.viradas.length == 2) setTimeout(GAME.verificacao, 1500);
            }
        }
    }
}

window.addEventListener('click', onMouseClick, false);

window.addEventListener("wheel", event => {
    if (event.shiftKey) {
        // Move a câmera na horizontal
        if (event.deltaY > 0) {
            camera.position.x += 1;
        } else {
            camera.position.x -= 1;
        }
    } else {
        // Zoom (FOV)
        if (event.deltaY > 0) {
            GAME.cam.fov = Math.min(GAME.cam.fov + 2, 120); // Limite máximo
        } else {
            GAME.cam.fov = Math.max(GAME.cam.fov - 2, 10); // Limite mínimo
        }
        camera.fov = GAME.cam.fov;
        camera.updateProjectionMatrix();
    }
});

document.addEventListener("DOMContentLoaded", BuscarCartas);
document.addEventListener("resize", ResetScene);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setAnimationLoop(animate);