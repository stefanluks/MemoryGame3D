import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

export default class Carta{
    constructor(nome, id, codigo){
        this.nome = nome;
        this.id = id;
        this.codigo = codigo;
        this.bloqueado = false;
        this.modelo = new THREE.BoxGeometry( 1, 0.01, 1.3 );
        this.materiais = [];
        this.cores = {
            lados: new THREE.Color(),
            frente: new THREE.Color(),
            costas: new THREE.Color(),
        };
        this.texturas = {
            frente: null,
            costas: null
        }
        this.objeto = null;
        this.voltar = false;
        this.carta = this.GetNomeCarta();
    }

    SetCores(){
        this.cores.lados.setStyle("rgb(255, 255, 255)");
        this.cores.lados.convertSRGBToLinear();
        this.cores.frente.setStyle("rgb(255,0,255)");
        this.cores.frente.convertSRGBToLinear();
        this.cores.costas.setStyle("rgb(75,0,130)");
        this.cores.costas.convertSRGBToLinear();
        this.SetTexturas();
    }

    SetTexturas(){
        this.texturas.frente = textureLoader.load("public/imagens/"+this.carta);
        this.texturas.costas = textureLoader.load("public/imagens/Costas.png");
        this.texturas.frente.flipY = false;
        this.texturas.frente.wrapS = THREE.RepeatWrapping;
        this.texturas.frente.repeat.x = -1;
        this.SetMateriais();
    }

    SetMateriais(){
        this.materiais = [
            new THREE.MeshBasicMaterial({ color: this.cores.lados }),   // direita (+X)
            new THREE.MeshBasicMaterial({ color: this.cores.lados }),   // esquerda (-X)
            new THREE.MeshBasicMaterial({ map: this.texturas.costas }), // frente (+Z)
            new THREE.MeshBasicMaterial({ map: this.texturas.frente }), // frente (+Z)
            new THREE.MeshBasicMaterial({ color: this.cores.frente }),  // topo (+Y)
            new THREE.MeshBasicMaterial({ color: this.cores.costas }),   // base (-Y)
            new THREE.MeshBasicMaterial({ color: this.cores.lados })    // trás (-Z)
        ];
        this.MakeObject();
    }

    GetNomeCarta(){
        let lista = this.nome.split(" ");
        this.carta = lista[lista.length-1]+".png";
        this.SetCores();
    }

    MakeObject(){
        this.objeto = new THREE.Mesh( this.modelo, this.materiais );
        this.objeto.rotation.x = 4.7
        this.objeto.rotation.y = 3.15
        this.objeto.rotation.z = 3.15
    }

    getObjeto(){
        return this.objeto;
    }

    clicado(){
        // Se está animando, não faz nada
        // if(this.click || this.voltar) return;
        // Se está virada (parada), inicia desvirar
        if(this.objeto.rotation.z >= 6) {
            this.click = true;
            this.voltar = true;
            return;
        }
        // Se está desvirada (parada), inicia virar
        if(this.objeto.rotation.z <= 3.15) {
            this.click = true;
            return;
        }
    }


    Atualizar(){
        if(this.click){
            if(this.objeto.rotation.z < 6.4 && !this.voltar){
                this.objeto.rotation.z += 0.05;
            }
            if(this.objeto.rotation.z >= 6.4){
                this.voltar = true;
                this.click = false;
            }
            if(this.objeto.rotation.z <= 3.1){
                this.voltar = false;
                this.click = false;
            }
            if(this.objeto.rotation.z >= 3.1 && this.voltar){
                this.objeto.rotation.z -= 0.05;
            }
        }
        // Animação de introdução: mover do centro até a posição final
        if(this.intro){
            const speed = 0.1; // ajuste a velocidade aqui
            // Interpolação linear para x
            this.objeto.position.x += (this.pos_final_x - this.objeto.position.x) * speed;
            // Interpolação linear para y
            this.objeto.position.y += (this.pos_final_y - this.objeto.position.y) * speed;
            // Se estiver suficientemente próximo do destino, finalize a animação
            if (Math.abs(this.objeto.position.x - this.pos_final_x) < 0.01 && Math.abs(this.objeto.position.y - this.pos_final_y) < 0.01) {
                this.objeto.position.x = this.pos_final_x;
                this.objeto.position.y = this.pos_final_y;
                this.intro = false;
            }
        }
    }

    SetPosFinal(posFinalX, posFinalY){
        this.intro = true;
        this.pos_final_x = posFinalX;
        this.pos_final_y = posFinalY;
    }
}