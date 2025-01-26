let groundSprites

let GRAVITY = 0.5
let SPEED = 1
const JUMP = -15

let numGroundSprites
let obstacleSprites
let player


let widthWindow = window.innerWidth - 5
let heightWindow = window.innerHeight - 5

const GROUND_SPRITE_WIDTH = widthWindow/20
const GROUND_SPRITE_HEIGHT = 50

let isGameOver
let playerLives

let probability = 0.95

let spawnIntervalCooldown = 100
let probabilityIntervalCooldownChange = 4000

// Color mecanic
let colorGreen = "#03384A"
let colorWhite = "#FFFFFF"

let imageNotCreated = true

let spawnInterval = setInterval (() => {
    let position = [50, 120, 220, 300][floor(random() * 4)]
    if (random() > probability) {
        let obstacle = createSprite(
        camera.position.x + width,
        height - position - 15,
        30,
        30
        )
        obstacle.shapeColor = colorGreen
        obstacleSprites.add(obstacle)
    }
}, spawnIntervalCooldown)

let changeProbabilityInterval = setInterval(()=>{
    clearInterval(spawnInterval)
    if (spawnIntervalCooldown >= 80) {
        spawnIntervalCooldown -= 20
    }
    else if (probability >= 0.76) {
        probability -= 0.02
    }
    spawnInterval = setInterval (() => {
        let position = [50, 120, 220, 300][floor(random() * 4)]
        if (random() > probability) {
            let obstacle = createSprite(
            camera.position.x + width,
            height - position - 15,
            30,
            30
            )
            obstacle.shapeColor = colorGreen
            obstacleSprites.add(obstacle)
        }
    }, spawnIntervalCooldown)
}, probabilityIntervalCooldownChange)

let speedInterval = setInterval(() => {
    if (SPEED < 3.5) {SPEED += 0.25}
}, 5000)

function setup() {
    if (imageNotCreated) {
        for (let i of [1, 2, 3]) {
            let img = document.createElement('img')
            img.src = "skateboard.png" 
            img.alt = "life"
            img.classList.add("life")
            img.id = `life-${i}`
            document.getElementById("lives").appendChild(img)
            imageNotCreated = false
        }
    }
    let gameDiv = document.getElementById("game")
    let h1 = document.createElement("h1")
    h1.innerHTML = "Pixel runner"
    gameDiv.appendChild(h1)
    for (let p of ["Avoid pixels coming", "Press up arrow to jump", "Press bottom arrow to force landing", "Refresh page / press space to play again"]) {
        let par = document.createElement("p")
        par.innerHTML = p
        gameDiv.appendChild(par)
    }
    let scoreH = document.createElement("h2")
    scoreH.id = "score"
    document.body.appendChild(scoreH)
    

    isGameOver = false
    playerLives = 3

    // SETUP CANVA
    createCanvas(widthWindow, heightWindow)
    background(255, 255, 255)

    // SETUP GROUND
    groundSprites = new Group()
    numGroundSprites = width / GROUND_SPRITE_WIDTH
    
    for (let n = 0; n <= numGroundSprites + 6; n++) {
        let groundSprite = createSprite(
        n * GROUND_SPRITE_WIDTH,
        height - 25,
        GROUND_SPRITE_WIDTH,
        GROUND_SPRITE_HEIGHT
        )
        groundSprite.shapeColor = colorGreen
        groundSprites.add(groundSprite)
    }

    // SETUP PLAYER
    player = createSprite(100, height - 75, 50, 50)
    player.shapeColor = colorGreen


    // SETUP OBSTACLES
    obstacleSprites = new Group()
}

let possibleDoubleJump = false

let score = 0
function draw() {
    if (keyDown(32)) {
        window.location.reload()
    }
    if (!isGameOver) {
        score += floor(10*SPEED)
        document.getElementById("score").innerHTML = `Score: ${score}`
        background(255, 255, 255)
        obstacleSprites.overlap(player, handleCollionWithObstacle)
        drawSprites()

        for (let n of [0, 1, 2]) {
            if (n >= playerLives) {
                document.getElementById(`life-${n+1}`).style.opacity = 0.20
            }
        }

        player.velocity.y = player.velocity.y + GRAVITY

        if (groundSprites.overlap(player)) {
            GRAVITY = 0.5
            player.velocity.y = 0
            player.position.y = height - 50 - player.height / 2
            
            if (keyDown(UP_ARROW)) {
                player.velocity.y = JUMP
                setTimeout(() => {
                    possibleDoubleJump = true
                }, 300)
            }
        }
        else {
            if (keyDown(UP_ARROW) && possibleDoubleJump) {
                player.velocity.y = 4*JUMP/5
                possibleDoubleJump = false
            }
            if (keyDown(DOWN_ARROW)) {
                GRAVITY += 0.6
            }
        }        
        
        player.position.x = player.position.x + 5*SPEED

        let firstGroundSprite = groundSprites[0]
        if (firstGroundSprite.position.x <= camera.position.x - (width / 2 + firstGroundSprite.width / 2)) {
            groundSprites.remove(firstGroundSprite)
            firstGroundSprite.position.x = firstGroundSprite.position.x + numGroundSprites * firstGroundSprite.width
            groundSprites.add(firstGroundSprite)
        }
        camera.position.x = player.position.x + width/4

        let firstObstacle = obstacleSprites[0]
        if (obstacleSprites.length > 0 && firstObstacle.position.x <= camera.position.x - (width / 2 + firstObstacle.width / 2)) {
        removeSprite(firstObstacle)
        }

        
    }
}

let invicibleTimeout
let invicible = false

function handleCollionWithObstacle () {
    if (playerLives === 0) {
        isGameOver = true
        clearInterval(changeProbabilityInterval)
        clearInterval(spawnInterval)
    }
    else {
        if (invicible) {return}
        playerLives--
        invicible = true
        invicibleTimeout = setTimeout(() => {
            invicible = false
            clearTimeout(invicibleTimeout)
        }, 2000)
    }
}