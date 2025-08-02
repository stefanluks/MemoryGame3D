import {GAME} from "../../main.js";
import * as THREE from 'three';
import Tela from "./Tela.js";

export const menu = new Tela("menu");
export const jogo = new Tela("jogo");

const textureLoader = new THREE.TextureLoader();

// Adiciona a mesa (um plano verde) ao fundo das cartas
let mesaGeometry = new THREE.BoxGeometry(10, 8, 4); // largura, altura, profundidade
let cor = new THREE.Color();
cor.setStyle("rgba(15, 34, 120, 1)");
cor.convertSRGBToLinear();
let menuMaterial = new THREE.MeshBasicMaterial({color:cor});
let mesa = new THREE.Mesh(mesaGeometry, menuMaterial);

menu.AddObjeto(mesa)

let btn = new THREE.BoxGeometry(0.5, 0.1, 5);
btn.name = "btn"
let btnColor = new THREE.Color();
btnColor.setStyle("rgba(28, 236, 24, 1)");
btnColor.convertSRGBToLinear();
let material = new THREE.MeshBasicMaterial({color: btnColor});
let botao = new THREE.Mesh(btn, material);
botao.name = "btn";

menu.AddObjeto(botao)





// Adiciona uma luz para realçar a mesa
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
menu.AddObjeto(light);
jogo.AddObjeto(light);
