var canvas = document.getElementById("miCanvas");
var ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.rect(20,40,50,50);
ctx.fillStyle = "#FF0000";
ctx.fill();
ctx.closePath();

ctx.beginPath();
ctx.arc(240,160,20,0, Math.PI * 2, false);
ctx.fillStyle = "green";
ctx.fill();
ctx.closePath();

ctx.beginPath();
ctx.rect(160,10,100,40);
ctx.strokeStyle = "rgba(0,0,255,0.5)";
ctx.stroke();
ctx.closePath();

// variables inicializadas a false, las teclas no están pulsadas en principio
var presionarDerecha = false;
var presionarIzquierda= false;

function teclaPulsada(e) {
    if (e.keyCode == 39){
        presionarDerecha = true;
    } else if (e.keyCode == 37) {
        presionarIzquierda = true;
    }
}

function teclaNoPulsada (e){
    if (e.keyCode == 39){ //el codigo 39 representa la flecha derecha
        presionarDerecha = false;
    } else if (e.keyCode == 37) { //el codigo 37 es la tecla izquierda
        presionarIzquierda = false;
    }
}
//un Listener llamado pulsada o no pulsada, en las que metemos las funciones anteriores e inicializadas a false
document.addEventListener("keydown", teclaPulsada, false);
document.addEventListener("keyup", teclaNoPulsada, false);
document.addEventListener("mousemove", movimientoRaton, false);

//posicion de salida de la bola aleatoria, ya que sinó sale siempre del mismo sitio y el juego es repetitivo
var x = Math.floor(Math.random() * (canvas.width - 100)) + 50;
var y = canvas.height - 30;

var dx = Math.random() < 0.5 ? 3 : -3; //dirección aleatoria, izquierda o derecha
var dy = -3; // aquí siempre negativo para que el primer movimiento de la bolas sea hcia arriba

var ballRadius = 15;

function drawBall() {
    ctx.beginPath(); //dibujo de la bola
    ctx.arc(x,y,ballRadius,0, Math.PI * 2); //posición inicial de la bola
    ctx.fillStyle = "#D4AF37"; //color de ella
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#F3E5AB";
    ctx.stroke();
    ctx.closePath();    
}

var paletaAlto = 14;
var paletaAncho = 150;
var paletaX = (canvas.width - paletaAncho)/2;

function dibujarPaleta(){
    ctx.beginPath();
    ctx.rect(paletaX, canvas.height - paletaAlto, paletaAncho, paletaAlto);
    ctx.fillStyle = "#679c52";;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#D3D3D3";
    ctx.stroke();
    ctx.closePath();
}

function movimientoRaton(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paletaX = relativeX - paletaAncho / 2;
    }
}

//PARTE DE LOS LADRILLOS
var brickRowCount = 9; //filas ladrillos
var brickColumnCount = 10; //columnas ladrillso
var brickWidth = 75; //ancho ladrillos
var brickHeight = 20; //alto ladrillos
var brickPadding = 8; //el hueco para que no se toquen los ladrillos
var brickOffsetTop = 60; //margen superior
var brickOffsetLeft = 32;  // margen izquierdo

var bricks = [];
for (c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1};
    }
}

function drawBricks() {
    for (c = 0; c < brickColumnCount; c++) {
        for (r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status == 1){
                var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                if(r<2) {
                    ctx.fillStyle = "#FFB6C1";
                } else if ( r< 4){
                    ctx.fillStyle = "#E6E6FA";
                } else {
                    ctx.fillStyle = "#DEB887";
                }
                ctx.fill();
                ctx.strokeStyle = "#FFFFFF"; //borde de los ladrillos blanco
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}


function collisionDetection() {
    for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if (score == brickRowCount * brickColumnCount){
                        alert("HAS GANADO!!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawTitle () {
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = "#D4AF37";
    ctx.textAlign = "center";
    ctx.fillText("ARKANOID", canvas.width /2, 25);
    ctx.textAlign = "left";
}

var score = 0;

function drawScore() {
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#555555";
    ctx.fillText("Score: " + score, 8, 20);
}

var lives = 3;

function drawLives() {
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillStyle = "#555555";
    ctx.fillText("Vidas: " + lives, canvas.width - 140, 25);

}


function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height); //esto borra en lienzo en las cordenadas que le damos
    dibujarPaleta();
    drawScore();
    drawLives();
    drawTitle();
    collisionDetection();
    drawBricks();
    drawBall(); //funcion de dibujar la bola
    
    //rebote izquierda derecha
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    //rebote arriba abajo
    if (y + dy < ballRadius) { // canbiamos la dirección de la bola si choca arriba o abajo
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius){
        if (x > paletaX && x < paletaX + paletaAncho){
            dy = -dy;
        }else{
            lives--;
            if (!lives){
            alert("FIN DEL JUEGO");
            clearInterval(intervalo); // detengo el bucle de los 10 milisegundos, se me quedaba pillado el juego
            resetearJuegoCompleto(); //reiniciamos el juego completamente al llegar las vidas a 0
        }else{
            clearInterval(intervalo); // detengo el bucle de los 10 milisegundos, se me quedaba pillado el juego
            resetearPosicion(); //usamos la funcion resetear posicion, solo la bola y la paleta
        }
    }
    }
    //movimiento pelota
    if (presionarDerecha && paletaX < canvas.width - paletaAncho) { // para que se mueva dentro de los limites del recuadro de juego, sinó se saldría
        paletaX += 9; // al presionar la derecha se moverá 7 px a la derecha cada vez
    } else if ( presionarIzquierda && paletaX > 0){
        paletaX -=9; // aquí se moverá 7 px hacia la izquierda
    }
    x += dx; //aquí le sumamos y restamos para que la bola se mueva
    y += dy;
}
    

function resetearPosicion(){
    x = Math.floor(Math.random() * (canvas.width - 100)) + 50;
    y = canvas.height - 40;
    dx = Math.random() < 0.5 ? 3 : -3;
    dy = -3;
    paletaX = (canvas.width - paletaAncho) / 2;

    window.focus();
    intervalo = setInterval(draw,10);
}

function resetearJuegoCompleto(){
    score = 0;
    lives = 3;

    for (let c = 0; c<brickColumnCount; c++){
        for (let r = 0; r<brickRowCount; r++){
            bricks[c][r].status = 1;
        }
    }
    resetearPosicion();//recolocamos la bola y la paleta de nuevo
}

var intervalo = setInterval(draw,10); //intervalo en el que se vuelve a pintar la vola, 10 milisegundos
