// uses ECMAScript 2015 features, sorry IE

// parameters
const SIZE = 20;
const SCALE = 20;
const COLOR = "#669900";
const FOOD = "#cc6600";
const BG_COLOR = "#000";
let SPEED = 200;  // speed: 200 -> 5 steps per second

// initialization
let c = document.getElementById("jsnake");
c.width = (SIZE * SCALE);
c.height = (SIZE * SCALE);

let ctx = c.getContext("2d");

let snake = {
    "direction": "right",
    "last_direction": "right",
    "tail": [[5, 5], [4, 5]],  // ring buffer of the positions of the snake
    "len": 2,
    "step": 0,  // helper variable to calculate the correct index in the ring buffer
    "food": [],
    "gameOver": false
}
const COORDINATES = [].concat(...[...Array(SIZE).keys()].map(x => [...Array(SIZE).keys()].map(y => [x, y])));
snake.food = randomPosition();

// main 'loop'
let main = loop(SPEED);

console.log("Welcome to jsnake!");
console.log("Steer with WSAD and have some fun!");
console.log("Enjoy its weird world with helical boudaries!");
console.log("Speed up with e and down with q.");

function turnUp() {
    if(snake.last_direction != "down")
        snake.direction = "up";
}
function turnDown() {
    if(snake.last_direction != "up")
        snake.direction = "down";
}
function turnLeft() {
    if(snake.last_direction != "right")
        snake.direction = "left";
}
function turnRight() {
    if(snake.last_direction != "left")
        snake.direction = "right";
}

// listen for keypresses
document.onkeydown = function(e) {
    switch(e.keyCode) {
        case 38:
        case 87:
            turnUp();
            break;
        case 40:
        case 83:
            turnDown();
            break;
        case 37:
        case 65:
            turnLeft();
            break;
        case 39:
        case 68:
            turnRight();
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

// steering using touch gestures
let xDown = null;
let yDown = null;

document.ontouchstart = function(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

document.ontouchmove = function (evt) {
    if(! xDown || ! yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    // only handle the event, if the swipe started or ended in the canvas
    let r = c.getBoundingClientRect();
    if(
               xUp - r.left > 0
            && yUp - r.top > 0
            && xUp - r.right < 0
            && yUp - r.bottom < 0
        ||     xDown - r.left > 0
            && yDown - r.top > 0
            && xDown - r.right < 0
            && yDown - r.bottom < 0) {
        // prevent scroll if inside canvas
        evt.stopPropagation();
    } else {
        // do nothing if outside canvas
        return;
    }

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    // which component is longer
    if(Math.abs(xDiff) > Math.abs(yDiff)) {
        if ( xDiff > 0 ) {
            turnLeft();
        } else {
            turnRight();
        }
    } else {
        if(yDiff > 0) {
            turnUp();
        } else {
            turnDown();
        }
    }

    xDown = null;
    yDown = null;
};

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

    if(snake.len > SIZE * SIZE) {
        // if the snake has max length, place the food outside
        x, y = -1, -1;
        snake.gameOver = true;
    } else if(snake.len > SIZE * SIZE - 30) {
        // if only a few places are left, get random points from the free positions
        let s = new Set([...snake.tail].map(p => p.toString()));
        let free = [...COORDINATES].filter(p => !s.has(p.toString()));
        p = free[Math.floor(Math.random() * free.length)];
        [x, y] = p;
    } else {
        // else try points at random
        do {
            x = Math.floor(Math.random() * SIZE);
            y = Math.floor(Math.random() * SIZE);
        } while(isSnake([x, y]));
    }

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
