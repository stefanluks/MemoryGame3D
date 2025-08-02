import * as THREE from 'three';

export default class Tela{
    constructor(nome){
        this.nome = nome;
        this.cena = new THREE.Scene();
        this.objetos = [];
    }

    AddObjeto(objeto){
        this.objetos.push(objeto);
        this.cena.add(objeto);
    }

    getBtn(nome){        
        let btn = this.objetos.find(b => b.name == nome);
        // console.log(btn)
        return btn;
    }
}