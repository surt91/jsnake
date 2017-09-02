// uses ECMAScript 2015 features, sorry IE

// parameters
const SIZE = 20;
const SCALE = 20;
const COLOR = "#669900";
const FOOD = "#cc6600";
const BG_COLOR = "#000";
let SPEED = 200;  // speed: 200 -> 5 steps per second

// initialization
var c = document.getElementById("jsnake");
c.width = (SIZE * SCALE);
c.height = (SIZE * SCALE);

var ctx = c.getContext("2d");

var snake = {
    "direction": "right",
    "last_direction": "right",
    "tail": [[5, 5], [4, 5]],  // ring buffer of the positions of the snake
    "len": 2,
    "step": 0,  // helper variable to calculate the correct index in the ring buffer
    "food": [],
    "gameOver": false
}
snake.food = randomPosition();

// main 'loop'
let main = loop(SPEED);

console.log("Welcome to jsnake!");
console.log("Steer with WSAD and have some fun!");
console.log("Enjoy its weird world with helical boudaries!");
console.log("Speed up with e and down with q.");

// listen for keypresses
document.onkeydown = function(e) {
    switch(e.keyCode) {
        case 38:
        case 87:
            if(snake.last_direction != "down")
                snake.direction = "up";
            break;
        case 40:
        case 83:
            if(snake.last_direction != "up")
                snake.direction = "down";
            break;
        case 37:
        case 65:
            if(snake.last_direction != "right")
                snake.direction = "left";
            break;
        case 39:
        case 68:
            if(snake.last_direction != "left")
                snake.direction = "right";
            break;
        case 69:
            window.clearInterval(main);
            SPEED *= 0.8;
            main = loop(SPEED);
            break;
        case 81:
            window.clearInterval(main);
            SPEED *= 1/0.8;
            main = loop(SPEED);
            break;
    }
}

function loop(speed) {
    return window.setInterval(function () {
        move();
        draw();
    }, speed);
}

function samePosition(p1, p2) {
    if(p1.length != p2.length) {
        return false;
    }

    for(let i=0; i < p1.length; i++) {
        if(p1[i] != p2[i]) {
            return false;
        }
    }

    return true;
}

function randomPosition() {
    function isSnake(p1) {
        for(let p2 of snake.tail) {
            if(samePosition(p1, p2))
                return true;
        }
        return false;
    }

    do {
        x = Math.floor(Math.random() * SIZE);
        y = Math.floor(Math.random() * SIZE);
    } while(isSnake([x, y]));

    return [x, y];
}

function move() {
    let [x, y] = snake.tail[snake.step % snake.len];
    snake.step++;
    let idx = snake.step % snake.len;

    // use helical boundary conditions
    // in this case it is more complex than periodic, but I don't want
    // something different
    switch(snake.direction) {
        case "up":
            if(y == 0)
                x++;
            snake.tail[idx] = [x % SIZE, (y-1 + SIZE) % SIZE];
            break;
        case "down":
            if(y == SIZE - 1)
                x--;
            snake.tail[idx] = [(x + SIZE) % SIZE, (y+1) % SIZE];
            break;
        case "left":
            if(x == 0)
                y++;
            snake.tail[idx] = [(x-1 + SIZE) % SIZE, y % SIZE];
            break;
        case "right":
            if(x == SIZE - 1)
                y--;
            snake.tail[idx] = [(x+1) % SIZE, (y + SIZE) % SIZE];
            break;
    }

    for(let i=0; i < snake.tail.length; i++)  {
        if(idx != i && samePosition(snake.tail[i], snake.tail[idx])) {
            snake.gameOver = true;
        }
    }

    if(samePosition(snake.food, snake.tail[idx])) {
        snake.len++;
        snake.tail.splice(idx, 0, snake.tail[idx]);
        snake.step = idx;
        snake.food = randomPosition();

        console.log("yum");
    }

    snake.last_direction = snake.direction;
}

function draw() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, SIZE*SCALE, SIZE*SCALE);

    ctx.fillStyle = FOOD;
    let [x, y] = snake.food;
    ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);

    ctx.fillStyle = COLOR;
    for(let [x, y] of snake.tail) {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);
    }

    if(snake.gameOver) {
        window.clearInterval(main);
        ctx.fillStyle = "#aa0000";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", SIZE*SCALE/2, SIZE*SCALE/2);
    }
}
