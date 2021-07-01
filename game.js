//define o canvas
const canvas = document.getElementById("game-canvas")
const ctx = canvas.getContext("2d")

// define os sprites e assets
const sprite = new Image()
sprite.src = "./sprites/all_Sprites.png"

//define músicas e sons

const musica = new Audio('./songs/melhor.mp3')
musica.muted = true
musica.loop = true

var isMute = true 

var buttonMuteValue = document.getElementById("toggleAudio").value

function toggleMute() {
    isMute = !isMute
    if (isMute == false){
        musica.muted = false
    }else{
        musica.muted = true
    }
}


//variaveis iniciais
var frames = 0;
var pressed = false;
const WIDTH = 800;
const ALTURA = 400;
const maxJump = 2;
var actualState = 0
var record
var colisaoChao = 350

const estado = {
    jogar: 0,
    jogando: 1,
    perdeu: 2
}


//objetos do jogo


//chão
const ground = {
    Largura: 800,
    pos1: 0,
    pos2: 800,
    pos3: 1600,
    velocidade: 7,
    desenha: () => {
        ctx.drawImage(
            sprite, 
            20, 20, 
            ground.Largura, 134, 
            ground.pos1, 266, 
            ground.Largura, 134)
        
        ctx.drawImage(
            sprite, 
            860, 20, 
            ground.Largura, 207, 
            ground.pos2, 193, 
            ground.Largura, 207)
        
        ctx.drawImage(
            sprite, 
            20, 280, 
            ground.Largura, 293, 
            ground.pos3, 106, 
            ground.Largura, 293)
    },
    atualiza: () => {
        ground.pos1 -= ground.velocidade
        ground.pos2 -= ground.velocidade
        ground.pos3 -= ground.velocidade

        if (ground.pos1 + ground.Largura <= 0){
            ground.pos1 = ground.pos3 + ground.Largura - ground.velocidade
        }

        else if(ground.pos2 + ground.Largura <= 0){
            ground.pos2 = ground.pos1 + ground.Largura
        }

        else if(ground.pos3 + ground.Largura <= 0){
            ground.pos3 = ground.pos2 + ground.Largura
        }
    }
}

//céu
const ceu = {
    desenha: () => {
        ctx.drawImage(
            sprite, 
            840, 280, 
            800, 600, 
            0, 0, 
            800, 600)
    }
}


const personagem = {
    posy: 450,
    posx: 250,
    altura: 150,
    largura: 100,
    cor: "#ff0000",
    gravidade: 1.5,
    velocidade: 0,
    forcaPulo: 18,
    qtdPulos: 0,
    munição: 4,
    tempoPonto: 15,
    score: 0,
    atualiza: () => {
        personagem.velocidade += personagem.gravidade
        personagem.posy += personagem.velocidade

        if ( personagem.posy > colisaoChao - personagem.altura){
            personagem.posy = colisaoChao - personagem.altura
            personagem.qtdPulos = 0
        }
        

        if(actualState == estado.jogando){
            if(personagem.tempoPonto == 0){
                personagem.score ++
                personagem.tempoPonto = 15
            }else{
                personagem.tempoPonto --
            }
        }

        
    },
    movimentos: [
        {fontex:20 , fontey:660},
        {fontex:140 , fontey:660},
        {fontex:260 , fontey:660},
        {fontex:380 , fontey:660},
        {fontex:500 , fontey:660},
        {fontex:20 , fontey:824},
        {fontex:140 , fontey:824},
        {fontex:260 , fontey:824},
        {fontex:380 , fontey:824},
        {fontex:500 , fontey:824}
    ],
    frameAtual: 0,
    atualizarFrame(){   
        const Intervalo = 4
        const passouOIntervalo = frames % Intervalo 
        


        if (passouOIntervalo === 0){
            const baseIncrimento = 1
            const Incrimento = baseIncrimento + personagem.frameAtual
            const baseRepet = personagem.movimentos.length
            personagem.frameAtual = Incrimento % baseRepet
        }
    },
    desenha: () => {
        personagem.atualizarFrame()
        const {fontex, fontey} = personagem.movimentos[personagem.frameAtual]
        ctx.drawImage(
            sprite, 
            fontex, fontey, 
            personagem.largura, personagem.altura, 
            personagem.posx, personagem.posy, 
            personagem.largura, personagem.altura)

        
    },
    pulo: () => {
        if (personagem.qtdPulos < maxJump){
            personagem.velocidade = -personagem.forcaPulo
            personagem.qtdPulos ++
        }
    },
    reset: () => {
        personagem.munição = 4
        personagem.tempoPonto = 15

        if (personagem.score > record){
            localStorage.setItem("record", personagem.score)
            record = personagem.score
        }

        personagem.score = 0
        personagem.frameAtual = 0
    }
}



const ataque = {
    altura: 20,
    largura: 20,
    posy: personagem.posy,
    posx: personagem.posx + 50,
    cor: "#FFD700",
    velocidade: 30,
    conjunto: [],
    ataque: () => {
        if(personagem.munição > 0){
            pressed = true
            ataque.conjunto.push(
                {x:300, y: personagem.posy + 65}
            )
            personagem.munição -= 1
        }
    },
    desenha: () =>{
        ataque.conjunto.map((key) => {
            ctx.fillStyle = (ataque.cor)
            ctx.fillRect(key.x, key.y, ataque.largura, ataque.altura)
        })
        
    },
    atualiza: () => {
        ataque.conjunto.map((key, i) => {
            //acelera o projétil
            key.x += ataque.velocidade
            //deleta projéteis
            if (key.x >= WIDTH){
                ataque.conjunto.splice(i)
                pressed = false
            }

            
        })
    },
    limpa: () => {
        ataque.conjunto = []
    }
}

const obstaculos = {
    obs: [],
    velocidade: 7,
    intervalo: 0,
    baseIntervalo: 70,
    insere: () => {
        obstaculos.obs.push({
            x: WIDTH,
            largura: 80 + Math.floor(10 * Math.random()),
            altura: 30,
            cor: "#696969"
        })

        obstaculos.intervalo = obstaculos.baseIntervalo + Math.floor(50 * Math.random())
    },
    atualiza: () => {

        if (personagem.score > 0 && personagem.score % 50 == 0 && obstaculos.velocidade < 12 && frames % 15 == 0){
            obstaculos.velocidade += 1
            obstaculos.baseIntervalo -= 7
        }
        
        if(obstaculos.intervalo === 0){
            obstaculos.insere()
        }else{
            obstaculos.intervalo--
        }

        obstaculos.obs.map((key) => {
            key.x -= obstaculos.velocidade

            if(personagem.posx < key.x + key.largura  && personagem.posx + personagem.largura >= key.x && personagem.posy + personagem.altura >= colisaoChao - key.altura){
                actualState = estado.perdeu
            }

            if(key.x <= -key.largura){
                obstaculos.obs.shift()
            }

            
        })
    },
    desenha: () => {
        obstaculos.obs.map((key) => {
            ctx.fillStyle = (key.cor)
            ctx.fillRect(key.x, colisaoChao - key.altura, key.largura, key.altura)
        })
    },
    reset: () => {
        obstaculos.obs = []
        obstaculos.velocidade = 7
        obstaculos.intervalo = 0
        obstaculos.baseIntervalo = 70
    }

    
}


const inimigos = {
    ini: [],
    velocidade: 8,
    intervalo: 120,
    baseIntervalo: 200,
    insere: () => {
        inimigos.ini.push({
            x: WIDTH + 70,
            largura: 40,
            altura: 75 + Math.floor(5 * Math.random()),
            cor: "#32CD32"
        })

        inimigos.intervalo = inimigos.baseIntervalo + Math.floor(90 * Math.random())
    },
    atualiza: () => {

        if (personagem.score > 0 && personagem.score % 50 == 0 && inimigos.velocidade < 14 && frames % 15 == 0){
            inimigos.velocidade += 1
            inimigos.baseIntervalo -= 10
        }
        
        if(inimigos.intervalo === 0){
            inimigos.insere()
        }else{
            inimigos.intervalo--
        }

        inimigos.ini.map((key) => {
            key.x -= inimigos.velocidade

            if(personagem.posx < key.x + key.largura  && personagem.posx + personagem.largura >= key.x && personagem.posy + personagem.altura >= colisaoChao - key.altura){
                actualState = estado.perdeu
            }

            if(key.x <= -key.largura){
                inimigos.ini.shift()
            }
        })

        ataque.conjunto.map((k, i) => {
            inimigos.ini.map((key, index) => {
                if(k.x < key.x + key.largura && k.x + 20 >= key.x && k.y + 20 >= colisaoChao - key.altura){
                    inimigos.ini.splice(index)
                    ataque.conjunto.splice(i)
                }
            })
        })
    },
    desenha: () => {
        inimigos.ini.map((key) => {
            ctx.fillStyle = (key.cor)
            ctx.fillRect(key.x, colisaoChao - key.altura, key.largura, key.altura)
        })
    },
    reset: () => {
        inimigos.ini = []
        inimigos.velocidade = 8
        inimigos.intervalo = 120
        inimigos.baseIntervalo = 200
    }
}

const recarregar = {
    cartuchos: [],
    velocidade: 15,
    intervalo: 190,
    largura: 30,
    altura: 30,
    cor: "#FF00FF",
    insere: () => {
        recarregar.cartuchos.push(
            {x: WIDTH, y: ALTURA / 3 - 15}
        )
    },
    atualiza: () => {
        
        if(recarregar.intervalo === 0){
            recarregar.insere()
            recarregar.intervalo = 500 + Math.floor(50 * Math.random())
        }else{
            recarregar.intervalo--
        }
        

        recarregar.cartuchos.map((key)=> {
            key.x -= recarregar.velocidade
            if(personagem.posx < key.x + recarregar.largura  && personagem.posx + personagem.largura >= key.x && personagem.posy  <= key.y + recarregar.altura){
                recarregar.cartuchos.shift()
                if(personagem.munição < 4){
                    personagem.munição += 2
                }
            }
            if(key.x < -recarregar.largura){
                recarregar.cartuchos.shift()
            }
        })
    },
    desenha: () => {
        recarregar.cartuchos.map((key) => {
            ctx.fillStyle = (recarregar.cor)
            ctx.fillRect(key.x, key.y, recarregar.largura, recarregar.altura)
        })
    },
    reset: () => {
        recarregar.cartuchos = []
        recarregar.intervalo = 200
    }
}




//comanda o jogo como um todo
function main(){
    document.addEventListener("keydown", handleKeyDown)

    record = localStorage.getItem("record")

    if(record == null){
        record = 0;
    }

    loop()
};


//Atualiza a parte Lógica do jogo
function atualiza(){
    frames ++

    if (actualState == estado.jogando){
        obstaculos.atualiza()
        inimigos.atualiza()
        recarregar.atualiza()
        if (pressed){
            ataque.atualiza()
        }
    } 
    personagem.atualiza()
    ground.atualiza()
}

//Desenha todos os sprites na tela
function desenha(){
    ceu.desenha()
	ground.desenha()

    if (actualState == estado.jogando){
        obstaculos.desenha()
        inimigos.desenha()
        recarregar.desenha()
        if (pressed){
            ataque.desenha()
        }

        ctx.fillStyle = "#fff"
        ctx.font = "30px Arial"
        ctx.fillText("Score", 10, 106)

        ctx.fillStyle = "#fff"
        ctx.font = "50px Arial"
        ctx.fillText(personagem.score, 30, 68)

        ctx.fillStyle = "#fff"
        ctx.font = "30px Arial"
        ctx.fillText("Munição", 650, 106)

        ctx.fillStyle = "#fff"
        ctx.font = "50px Arial"
        ctx.fillText(personagem.munição, 700, 68)
    }

    else if (actualState == estado.jogar){
        ctx.fillStyle = ("#006400")
        ctx.fillRect(WIDTH / 2 - 50 , ALTURA / 2 - 50, 100, 100)
    }

    else if (actualState == estado.perdeu){
        ctx.fillStyle = ("#FF0000")
        ctx.fillRect(WIDTH / 2 - 50, ALTURA / 2 - 50, 100, 100)
        ctx.fillStyle = "#fff"
        ctx.font = "50px Arial"

        if(personagem.score > record){
            ctx.font = "50px Arial"
            ctx.fillText("Novo Record!", WIDTH / 2 - 150, ALTURA /2 - 65)
        }

        else if (personagem.score <= record && record < 10){
            ctx.fillText("Seu Record " + record, WIDTH / 2 - 90, ALTURA /2 - 65)
        }

        else if (personagem.score <= record && 10 < record < 100){
            ctx.fillText("Seu Record " + record, WIDTH / 2 - 150, ALTURA /2 - 65)
        }

        else if (personagem.score <= record && record > 100){
            ctx.fillText("Seu Record " + record, WIDTH / 2 - 160, ALTURA /2 - 65)
        }

        if(personagem.score < 10){
            ctx.fillText(personagem.score, WIDTH / 2 - 13, ALTURA /2 + 19)
        }

        else if (personagem.score >= 10 && personagem.score < 100){
            ctx.fillText(personagem.score, WIDTH / 2 - 26, ALTURA /2 + 19)
        }

        else if (personagem.score >= 100){
            ctx.fillText(personagem.score, WIDTH / 2 - 39, ALTURA /2 + 19)
        }
        
        
    }

    
    personagem.desenha()


    
        
}


//Gera o loop de testes necessários para o jogo
function loop(){
    desenha()
    atualiza()


    // console.log(`tile1: ${tile1.posx} tile2: ${tile2.posx} tile3: ${tile3.posx}`)

    requestAnimationFrame(loop)
}


//Lida com as teclas
function handleKeyDown(event){
    const Keypressed = event.key
    const code = event.keyCode
    
    if (Keypressed === "ArrowUp"){
        personagem.pulo()
    }
    if (Keypressed === "z" || Keypressed === "Z"){
        ataque.ataque()
    }

    if (code == 13){
        if (actualState == estado.jogar){
            actualState = estado.jogando
            musica.play()
        }
    
        else if(actualState == estado.perdeu){
            actualState = estado.jogar
            obstaculos.reset()
            recarregar.reset()
            inimigos.reset() 
            personagem.reset()
            ataque.limpa()
            frames = 0
            
        }
    }
}
main()