class Movement extends Phaser.Scene {
    constructor() {
        super("movementScene");
        this.my = {
            sprite: {
                avatar: null,
                bullets:[],
                enemies:[],
                enemyArrows: []
            },
            text: {}
        };  // Create an object to hold sprite bindings  

        this.maxBullets = 10; 
        this.score = 0;
        this.playerHealth = 3;
        this.avatarStage = 0; // state of avatar
        this.gameOver = false; // initialize gameOver and winner to false
        this.winner = false;
        
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        this.load.setPath("./assets/");
        // load player stages
        this.load.image("avatar", "character_roundPurple.png");
        this.load.image("avatar2", "character_roundYellow.png");
        this.load.image("avatar3", "character_roundRed.png");
        // load bullet
        this.load.image("bullet", "tile_heart.png");
        // load enemies
        this.load.image("enemy1","slimeBlock.png");
        this.load.image("enemy2", "ghost.png");
        // load enemy bullets
        this.load.image("arrow","item_arrow.png");
        this.load.image("spear", "item_spear.png");
        // load audio
        this.load.audio("hit", "jingles_HIT13.ogg");
        this.load.audio("glitter", "glitter.mp3");

    }

    create() {
        let my = this.my;   // create an alias to this.my for readability
        // add sprite
        my.sprite.avatar = this.add.sprite(game.config.width /2, game.config.height - 40, "avatar");
        // add score text
        this.my.text.score = this.add.text(10,10, "Score: 0",{
            fontSize: "18px",
            color: "#ffffff"
        });
        // add lives text
        this.my.text.lives = this.add.text(game.config.width - 120,10, "Lives: " + this.playerHealth,{
            fontSize: "18px",
            color: "#ffffff"
        });
        // initialize the game
        this.init_game();
        // group of sfx
        this.sfx= {
            hit: this.sound.add("hit"),
            glitter: this.sound.add("glitter")
        }

        //keys
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        // speeds
        this.avatarSpeed = 300;
        this.bulletSpeed = 300;
        // points on the path
        const points = [
            [-50,38],
            [709,36],
            [709,104],
            [34,102],
            [44,102],
            [43,181],
            [717,183],
            [706,262],
            [46,253],
            [44,338],
            [690,345],
            [696,421],
            [48,407],
            [40,490],
            [709,480]
        ]
        const path2 = [
            [35,64],
            [171,302],
            [335,47],
            [533,236],
            [689,69]
        ]

        // create the path
        this.enemy1_path = new Phaser.Curves.Path(points[0][0], points[0][1]);
        for (let i = 1; i< points.length; i++){
            this.enemy1_path.lineTo(points[i][0], points[i][1]);
        }
        this.enemy2_path = new Phaser.Curves.Path(path2[0][0], path2[0][1]);
        for (let i = 1; i < path2.length; i++){
            this.enemy2_path.lineTo(path2[i][0], path2[i][1]);
        }
        // add 10 enemy1s to the path
        for (let i = 1; i<= 10; i++){
            let enemy = this.add.follower(this.enemy1_path, 54, 54, 'enemy1');
            enemy.scorePoints = 100;
            enemy.arrows = [];
            enemy.shootCooldown = Phaser.Math.Between(1,3);
            enemy.canShoot = (i % 3 === 0);
            enemy.objTexture = "arrow";
            enemy.objSpeed = 100;
            enemy.objAngle = 90;
            enemy.startFollow({
                    from: 0,
                    to: 1,
                    delay: i * 800,
                    duration: 30000,
                    ease: 'easeInSine',
                    repeat: -1,
                    positionOnPath: true,
                    rotateToPath: false,

            })
            my.sprite.enemies.push(enemy)
        }
        // add 5 big enemy2s to the path
        for (let i = 1; i<= 5; i++){
            let enemy2 = this.add.follower(this.enemy2_path, 54, 54, 'enemy2');
            enemy2.health = 3;
            enemy2.scorePoints = 500;
            enemy2.arrows = [];
            enemy2.canShoot = true;
            enemy2.shootCooldown = Phaser.Math.Between(2,5);
            enemy2.objTexture = "spear";
            enemy2.objSpeed = 200;
            enemy2.objAngle = 180;
            enemy2.startFollow({
                    from: 0,
                    to: 1,
                    delay: i * 1500,
                    duration: 30000,
                    ease: 'easeInSine',
                    repeat: -1,
                    positionOnPath: true,
                    rotateToPath: false,

            })
            my.sprite.enemies.push(enemy2)
        }

        
        
        
        


    }

    update(time, delta) {
        // check if the game is over and if it is restart
        if(this.gameOver){
            if(Phaser.Input.Keyboard.JustDown(this.keyR)){
                this.scene.restart();
            }
            return;
        }
        let my = this.my;    // create an alias to this.my for readability
        let dt = delta / 1000; // converts delta from ms to secs
        // player movement
        if (this.keyA.isDown){
            if (my.sprite.avatar.x > (my.sprite.avatar.displayWidth/2)){
                my.sprite.avatar.x -= this.avatarSpeed * dt;
            }
            
        }
        if (this.keyD.isDown){
            if (my.sprite.avatar.x < (game.config.width - (my.sprite.avatar.displayWidth/2))){
                my.sprite.avatar.x += this.avatarSpeed * dt;
            }
            
        }
        if(Phaser.Input.Keyboard.JustDown(this.keySpace)){
            if (my.sprite.bullets.length < this.maxBullets){
                my.sprite.bullets.push(this.add.sprite(
                    my.sprite.avatar.x, my.sprite.avatar.y - (my.sprite.avatar.displayHeight/2), "bullet")
                );
            }
        }
        // bullet and enemy collision
        my.sprite.bullets = my.sprite.bullets.filter((bullet) => bullet.y > -(bullet.displayHeight/2));
        for (let bullet of my.sprite.bullets){
            for (let enemy of my.sprite.enemies){
                if (enemy.visible && this.collides(enemy, bullet)){ // if enemy is there and the bullet collides
                    bullet.y = -100; // move the bullet off screen
                    this.sfx.hit.play(); // play sfx
                    if(enemy.health !== undefined){ // if the enemy is a big enemy (only big enemies have health) decrease it
                        enemy.health --;
                    
                        if (enemy.health <= 0){ // if the enemy is killed
                            enemy.stopFollow(); // stop the follow
                            enemy.visible = false; // make it disappear
                            enemy.x = -100; // move off screen
                            for (let arrow of enemy.arrows){
                                arrow.destroy(); // get rid of all the enemies arrows
                            }
                            enemy.arrows = []; // reset arrow array
                            this.score += enemy.scorePoints; // incr score
                            this.updateScore(); // update score
                        }
                    }else{
                        enemy.stopFollow(); // stop the follow
                        enemy.visible = false; // make it disappear
                        enemy.x = -100; // move off screen
                        for (let arrow of enemy.arrows){
                            arrow.destroy(); // get rid of enemy arrows
                        }
                        enemy.arrows = []; // reset array
                        this.score += enemy.scorePoints; // incr points
                        this.updateScore(); // update score
                    }      
                }
            }
        }
        // bullet movement
        for (let bullet of my.sprite.bullets){
            bullet.y -= this.bulletSpeed * dt;
        }
        // enemy bullet logic
        for(let enemy of my.sprite.enemies){
            if(!enemy.visible){ // if enemy is invisble, continue
                continue;
            }
            if(!enemy.canShoot){ // if the enemy cant shoot, continue
                continue;
            }
            enemy.shootCooldown -= dt;
            if (enemy.shootCooldown <= 0){ // check cooldown
                this.enemyShoot(enemy); // enemy can shoot
                enemy.shootCooldown = Phaser.Math.Between(1,3); // reset cooldown to be a random number 1-3 seconds
            }
        }
        // arrow movement
        for (let enemy of my.sprite.enemies){
            if (!enemy.visible){ // if enemy is invisible cont
                continue;
            }
            enemy.arrows = enemy.arrows.filter(arrow=>{ // similar to bullet function
                arrow.y += arrow.speed * dt;
                return arrow.y < game.config.height + arrow.displayHeight;
            })
        }
        // arrow collision
        for (let enemy of my.sprite.enemies){
            for (let arrow of enemy.arrows){
                if (this.collides(arrow, my.sprite.avatar)){ // if arrow hits user
                    arrow.y = game.config.height + 200;
                    this.playerHealth--; // decr user health
                    this.score -= 500; // decr user score
                    this.updateScore(); // update
                    this.my.text.lives.setText("Lives: " + this.playerHealth); // update live text
                    if(this.playerHealth <=0){
                        this.toggleGameOver(); // if player loses all lives, game over
                    }
                    
                }
            }
        }
        if(!this.winner && this.noEnemiesLeft()){
            this.showWinner();
        }
    }
// helper functions
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
    enemyShoot(enemy){
        let enemyobj = this.add.sprite(enemy.x,enemy.y + enemy.displayHeight/2, enemy.objTexture);
        enemyobj.angle = enemy.objAngle; // each enemyobj sprite was faced diff ways so gotta rotate them
        enemyobj.speed = enemy.objSpeed;
        enemy.arrows.push(enemyobj);
        
    }
    updateScore(){
        let my = this.my;
        my.text.score.setText("Score: " + this.score);
        this.avatarState();
    }
    avatarState(){
        let newStage = 0;
        if (this.score < 200){
            newStage = 0;
        }else if (this.score < 600){
            newStage = 1;
        }else{
            newStage = 2;
            
        }
        if (newStage != this.avatarStage){
            this.avatarStage = newStage;
            if(newStage === 0){
                this.my.sprite.avatar.setTexture("avatar");
            }else if(newStage === 1){
                this.my.sprite.avatar.setTexture("avatar2");
            }else{
                this.my.sprite.avatar.setTexture("avatar3");
            }
            this.sfx.glitter.play();
        }
        
    }
    toggleGameOver(){
        this.gameOver = true;
        this.add.text(game.config.width/2 - 150, game.config.height/2 - 30, "GAME OVER", {fontSize: "50px", color: "#950606"});
        this.add.text(game.config.width/2 - 150, game.config.height/2 + 30, "Press R to Restart", {fontSize: "50px", color: "#ffffff"});

    }
    noEnemiesLeft(){
        return this.my.sprite.enemies.every(enemy => !enemy.visible);
    }
    showWinner(){
        this.winner = true;
        this.gameOver = true;
        this.add.text(game.config.width/2 - 150, game.config.height/2 - 30, "YOU WIN!!!", {fontSize: "50px", color: "#500695"});
        this.add.text(game.config.width/2 - 150, game.config.height/2 + 30, "Press R to Restart", {fontSize: "50px", color: "#ffffff"});
    }
    init_game(){
        this.score = 0;
        this.playerHealth = 3;
        this.avatarStage = 0;
        this.gameOver = false;
        this.winner = false;
        this.my.sprite.bullets = [];
        this.my.sprite.enemies = [];
        this.my.sprite.enemyArrows = [];
        if(this.my.text.score){
            this.my.text.score.setText("Score: 0");
        }
        if(this.my.text.lives){
            this.my.text.lives.setText("Lives: 3");
        }
    }
}

