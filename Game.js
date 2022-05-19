let game;

// global object where to store game options
let gameOptions = {
  // first platform vertical position. 0 = top of the screen, 1 = bottom of the screen
  firstPlatformPosition: 2 / 10,

  // game gravity, which only affects the hero
  gameGravity: 1200,

  // hero speed, in pixels per second
  heroSpeed: 300,

  // platform speed, in pixels per second
  platformSpeed: 190,

  // platform length range, in pixels
  platformLengthRange: [50, 150],

  // platform horizontal distance range from the center of the stage, in pixels
  platformHorizontalDistanceRange: [0, 250],

  // platform vertical distance range, in pixels
  platformVerticalDistanceRange: [150, 300],
};

window.onload = function () {
  // game configuration object
  let gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: 0x444444,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      width: 540,
      height: 960,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 600,
        },
        debug: false,
      },
    },
    // game scenes
    scene: [GameIntro, Game, GameOver, YouWin],
  };
  game = new Phaser.Game(gameConfig);
  window.focus();
};

/**
 * ControlsSprite
 */
class ControlsSprite extends Phaser.GameObjects.Image {
  constructor(scene, x, y, config) {
    super(scene, y, x, 'controls');
    scene.add.existing(this);
    this.setX(x)
      .setY(y)
      .setAlpha(0.1)
      .setRotation(config.rotation)
      .setScrollFactor(0)
      .setScale(0.5);
    this.type = config.type;
    // hide control on non-touch devices
    if (!scene.sys.game.device.input.touch)
      this.setAlpha(0);
  }
}

/**
 * Controls
 */
class Controls {
  constructor(scene) {
    this.buttons = {};
    this._width = 96;
    this._height = 96;
    this._scene = scene;
    this._config = [
      {
        type: 'left',
        rotation: 1.5 * Math.PI
      },
      {
        type: 'right',
        rotation: 0.5 * Math.PI
      },
      {
        type: 'up',
        rotation: 0
      }
    ];
    this._config.forEach(el => {
      this.buttons[el.type] = new ControlsSprite(scene, 0, 0, el);
    });
  }
  adjustPositions() {
    let width = this._scene.cameras.main.width;
    let height = this._scene.cameras.main.height;
    this.buttons.left.x = 70;
    this.buttons.left.y = height - 70;
    this.buttons.right.x = 70 + 90 + 25;
    this.buttons.right.y = height - 70;
    this.buttons.up.x = width - 70;
    this.buttons.up.y = height - 70;
  }
  update() {
    this.leftIsDown = false;
    this.rightIsDown = false;
    this.upIsDown = false;
    let pointers = [];
    if (this._scene.input.pointer1 != null) {
      pointers.push(this._scene.input.pointer1);
    }
    if (this._scene.input.pointer2 != null) {
      pointers.push(this._scene.input.pointer2);
    }
    let buttons = [this.buttons.left, this.buttons.right, this.buttons.up];
    // check which pointer pressed which button
    pointers.forEach(pointer => {
      if (pointer.isDown) {
        console.log(pointer.x, pointer.y);
        let hit = buttons.filter(btn => {
          let x = btn.x - this._width / 2 < pointer.x && btn.x + this._width / 2 > pointer.x;
          let y = btn.y - this._height / 2 < pointer.y && btn.y + this._height / 2 > pointer.y;
          return x && y;
        });
        console.log("hit", hit)
        if (hit.length === 1) {
          // switch (hit[0].type) {
          //   case 'left':
          //     this.leftIsDown = true;
          //     break;
          //   case 'right':
          //     this.rightIsDown = true;
          //     break;
          //   case 'up':
          //     this.upIsDown = true;
          //     break;
          // }e
          if (hit[0].type == "left") {
            this.leftIsDown = true;
          }
          if (hit[0].type == "right") {
            this.rightIsDown = true;
          }
          if (hit[0].type == "up") {
            this.upIsDown = true;
          }
        }
      }
    });
  }
}

/* =========================================
            MAIN GAME SCENE
=========================================*/
class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "game",
      pack: {
        files: [
          {
            // load image before preload, for us in preload
            type: "image",
            key: "tc-logo",
            url: "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/all%20white.png?v=1649980778495",
          },
        ],
      },
    });
  }

  init() {
    // this.lives = 3;
    this.dreamCount = 0;
    this.platformsFinished = false;
    this.gameFinished = false;
    this.deathBy = "";
  }

  preload() {
    //  Load the Google WebFont Loader script
    this.load.script(
      "webfont",
      "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js"
    );

    // load dialog plugin
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI"
    );

    // load font plugin
    this.plugins.get("rexwebfontloaderplugin").addToScene(this);
    this.load.rexWebFont({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    // ================= MUSIC =================
    this.sound.stopAll();
    // load song
    const musicConfig = {
      volume: 0.5,
      loop: true,
      delay: 3000,
    };
    this.music = this.sound.add("moaMusic", musicConfig);
    this.music.play();

    // ================= LIVES TEXT =================
    // Lives (text)
    // WebFont.load({
    //   google: {
    //     families: ["Freckle Face", "Finger Paint", "Nosifer"],
    //   },
    //   active: () => {
    //     this.livesText = this.add
    //       .text(420, 50, "Lives: " + this.lives, {
    //         fontFamily: "Freckle Face",
    //         fontSize: 50,
    //         color: "#ffffff",
    //       })
    //       .setShadow(2, 2, "#333333", 2, false, true);
    //     this.livesText.setAlign("right");
    //     this.livesText.setOrigin();
    //     this.livesText.setScrollFactor(0);
    //     this.livesText.setDepth(1005);
    //   },
    // });

    //================= DREAMS TEXT =================
    WebFont.load({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
      active: () => {
        this.dreamsText = this.add
          .text(game.config.width / 2, 50, "Dreams: " + this.dreamCount, {
            fontFamily: "Freckle Face",
            fontSize: 50,
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
        this.dreamsText.setAlign("center");
        this.dreamsText.setOrigin();
        this.dreamsText.setScrollFactor(0);
        this.dreamsText.setDepth(1005);
      },
    });

    // ================= BACKGROUND LAYERS =================
    this.backdrop = this.add.image(300, -5000, "bg1");
    this.add.image(300, -3400, "bg2").setScrollFactor(0.8);
    this.add.image(300, -3400, "bg3").setScrollFactor(0.9);
    // this.add.image(300, -3400, "bg4").setScrollFactor(0.7);
    this.add.image(300, -2700, "stars1").setScrollFactor(0.5).setScale(0.6);
    this.add.image(300, -2800, "stars2").setScrollFactor(0.6).setScale(0.5);
    this.planets = this.add.image(300, -5300, "planets").setScrollFactor(0.5);
    this.add.image(350, -4720, "heavenCloudsBack").setScrollFactor(0.48);
    this.add
      .image(100, -5100, "heavenCloudsFront")
      .setScrollFactor(0.52)
      .setDepth(1002);

    // ================= PLATFORM GROUPS =================
    this.platforms = this.physics.add.staticGroup();
    this.clouds = this.physics.add.staticGroup();

    let firstPlatform = true;

    // ================== FOR TESTING ==================
    const startGameAtForTesting = -10100;
    // this.cameras.main.scrollY = startGameAtForTesting;

    // ================== PLATFORMS ==================
    // then create 5 platforms from the group
    for (let i = 0; i < 7; ++i) {
      let x = Phaser.Math.Between(80, 400); //320
      const y = 154 * i;
      // const y = startGameAtForTesting + Phaser.Math.Between(160, 170) * i;

      // make sure first platform is below tane - middle of screen(ish)
      if (i == 4 && firstPlatform == true) {
        firstPlatform = false;
        x = game.config.width / 2 - 40;
      }

      // create platform
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.2;
      platform.setDepth(1004);
      platform.body.updateFromGameObject();

      this.controls = new Controls(this);
      this.controls.adjustPositions();
    }

    // this.startPlatform = this.platforms.create(this.player.x, this.player.y + 120, "platform").setScale(0.2);
    // this.startPlatform.body.updateFromGameObject() ;

    // ================== CLOUDS ==================
    for (let i = 0; i < 5; ++i) {
      // cloud x y positions
      let x = Phaser.Math.Between(80, 400); //320
      let y = -4000 + 154 * i;
      // let y = startGameAtForTesting + Phaser.Math.Between(160, 170) * i;

      // random number between 0 & 3 for cloud image to be used
      let rand = Phaser.Math.Between(0, 3);
      const cloudNames = ["cloud1", "cloud2", "cloud3", "cloud4"];

      // create cloud platform
      const cloud = this.clouds.create(x, y, cloudNames[rand]);
      cloud.scale = 0.3;
      cloud.body.setSize(cloud.width, 10).setOffset(0, cloud.height);
      cloud.setDepth(1004);
      cloud.body.updateFromGameObject();
    }

    // ================= PLAYER =================
    this.player = this.physics.add.sprite(240, 320, "taneIdle");
    // this.player = this.physics.add.sprite(
    //   240,
    //   startGameAtForTesting,
    //   "taneIdle"
    // );

    this.player.setDepth(1003);
    this.player.body.setSize(30, 70).setOffset(50, 30);

    // ================= COLLIDERS =================
    this.physics.add.collider(this.platforms, this.player);
    this.physics.add.collider(this.clouds, this.player);

    //================ ANIMATIONS =================
    this.anims.create({
      key: "taneRun",
      frames: this.anims.generateFrameNumbers("taneRun", {
        frames: [16, 17, 18, 19, 20, 21, 22, 23],
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: "taneIdle",
      frames: this.anims.generateFrameNumbers("taneIdle", {
        frames: [0, 1, 2],
      }),
      frameRate: 5,
    });

    this.anims.create({
      key: "taneJump",
      frames: this.anims.generateFrameNumbers("taneJump", {
        frames: [12, 13, 14, 15],
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "blueOrb",
      frames: "blueOrb",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "pinkOrb",
      frames: "pinkOrb",
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: "lightning",
      frames: "lightning",
      frameRate: 15,
      repeat: -1,
    });
    this.anims.create({
      key: "hiwa",
      frames: "hiwa",
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "hiwa2",
      frames: "hiwa2",
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "hiwaGive",
      frames: "hiwaGive",
      frameRate: 5,
    });
    this.anims.create({
      key: "fireworksBlue",
      frames: "fireworksBlue",
      frameRate: 30,
    });
    this.anims.create({
      key: "fireworksBlue2",
      frames: "fireworksBlue2",
      frameRate: 30,
    });
    this.anims.create({
      key: "fireworksRocket",
      frames: "fireworksRocket",
      frameRate: 30,
      repeat: -1,
    });
    this.anims.create({
      key: "dreamDiamond",
      frames: "dreamDiamond",
      frameRate: 15,
      repeat: -1,
    });

    // ================= hiwa =================
    this.hiwa = this.physics.add
      .sprite(game.config.width / 2 + 20, -4990, "hiwa")
      .setScrollFactor(0.5)
      .setScale(1)
      .setDepth(1001)
    this.hiwa.immovable = true;
    this.hiwa.body.moves = false;
    this.hiwa.allowGravity = false;
    this.hiwa.play("hiwa2");

    // ================= ITEM GROUPS =================
    this.orbs = this.physics.add.group({
      classType: Orb,
      allowGravity: false,
      immovable: true,
    });
    this.lightning = this.physics.add.group({
      classType: Orb,
      allowGravity: true,
      immovable: false,
    });
    this.dreamPiece = this.physics.add.group({
      classType: Orb,
      allowGravity: false,
      immovable: true,
    });

    // ================= DREAM ORBS =================
    // create orbs
    for (var x = 0; x < 10; x++) {
      this.addOrb("blue");
    }
    for (var x = 0; x < 10; x++) {
      this.addOrb("pink");
    }

    // ================= OVERLAP EVENTS =================
    this.physics.add.overlap(
      this.player,
      this.orbs,
      this.handleCollectOrb,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.lightning,
      this.handleLightningStrike,
      undefined,
      this
    );
  } // End of create()

  update(t, dt) {
    if (!this.player) {
      return;
    }

    //  ============= CAMERA CHASER (camera moving up) ==============
    if (this.cameras.main.scrollY > -11000) {
      this.cameras.main.scrollY -= 1.2;
    } else if (
      this.cameras.main.scrollY <= -11000 &&
      this.gameFinished == false
    ) {
      /* ==============================
            *** GAME FINISHED ***
         ============================== */
      this.gameFinished = true;
      console.log("game finished");

      this.sound.play("cheer");

      //================= CONGRATS TEXT =================
      this.dreamsText.setVisible(false)
      WebFont.load({
        google: {
          families: ["Freckle Face", "Finger Paint", "Nosifer"],
        },
        active: () => {
          this.endText = this.add
            .text(game.config.width / 2, 150, "Nga mihi Tane!\nFor delivering the dreams to me,\nI will give you another\npiece of your dream.", {
              fontFamily: "Freckle Face",
              fontSize: 30,
              color: "#ffffff",
              backgroundColor: "#533d8e",
              padding: 10,
            })
            .setShadow(2, 2, "#333333", 2, false, true);
          this.endText.setAlign("center");
          this.endText.setOrigin();
          this.endText.setScrollFactor(0);
          this.endText.setDepth(1005);
        },
      });


      //================= HIWA'S KOHA =================
      this.hiwa.play("hiwaGive")
      this.hiwa.on('animationcomplete', function (animation) {
        if (animation.key === 'hiwaGive')
          this.dream = this.dreamPiece.get(game.config.width / 2 + 7, -11000 + (740 / 2 - 20), "dreamDiamond").setDepth(1006).play("dreamDiamond").setScale(0.4)
        this.sound.play("dreamSound")
      }, this);

      // this.dream.body.setSize(200, 200)
      // this.orbs.get(x, y, "pinkOrb");

      //================= FIREWORKS =================

      this.launchFireworks();
      // launch fireworks to the amount of dreams collected
      for (var i = 1; i < this.dreamCount; i++) {
        this.time.addEvent({
          delay: i * 1000,
          callback: this.launchFireworks,
          callbackScope: this,
        });
      }
      // after fireworks - hiwa gives dream piece

      //

    }
    else if (
      this.cameras.main.scrollY <= -11000
    ) {


      // this.blueOrb.x =this.follower.vec.x
      // this.blueOrb.y =this.follower.vec.y

      // this.graphics.lineStyle(1, 0xffffff, 1);

      // this.track.draw(this.graphics);

      // this.track.getPoint(this.follower.t, this.follower.vec);

      // graphics.fillStyle(0xff0000, 1);
      // graphics.fillCircle(path.vec.x, path.vec.y, 8);
      // this.blueOrb.setPosition(this.follower.vec.x, this.follower.vec.y);
    }

    // ============= UPDATE PLATFORMS ==============
    // get cameras changing scrollY
    const scrollY = this.cameras.main.scrollY;
    // stop placing platforms from -3500 scrollY (stop placing platforms at this height, and start placing clouds instead)
    if (scrollY < -3500 && this.platformsFinished == false) {
      // flag to catch change from platforms to clouds
      this.platformsFinished = true;
      // offset player body so looks like he is standing in the clouds.
      this.player.body.setOffset(50, 20);
    } else if (this.platformsFinished == false) {
      // update platforms
      this.platforms.children.iterate((child) => {
        const platform = child;
        // add new platforms above once platforms disappear below bottom line.
        // if platform is 750 below current scrollY
        if (platform.y >= scrollY + 960) {
          platform.y = scrollY - Phaser.Math.Between(50, 70); // random new y position relative to scrollY
          platform.x = Phaser.Math.Between(0, game.config.width); // random new x position
          platform.body.updateFromGameObject(); // update position
          this.addLightningAbove(platform); // add Lightning
        }
      });
    }
    // ============= UPDATE CLOUDS ==============
    if (this.platformsFinished == true) {
      this.clouds.children.iterate((child) => {
        const cloud = child;
        // add new clouds above once clouds disappear below bottom line.
        // if cloud is 750 below current scrollY
        if (cloud.y >= scrollY + 960) {
          cloud.y = scrollY - Phaser.Math.Between(50, 70); // random new y position relative to scrollY
          cloud.x = Phaser.Math.Between(0, game.config.width); // random new x position
          cloud.body.updateFromGameObject(); // update position
          this.addLightningAbove(cloud); // add Lightning
        }
      });
    }

    const playerJump = -310;
    const playerVelocity = 300;

    // ============= PLAYER CONTROLS ==============
    this.controls.update();

    // ---- Left control ----
    if ((this.cursors.left.isDown || this.controls.leftIsDown)) {
      this.player.setVelocityX(-playerVelocity);
      if (this.player.body.onFloor()) {
        this.player.play("taneRun", true);
      }
    }
    // ---- Right control ----
    else if ((this.cursors.right.isDown || this.controls.rightIsDown)) {
      this.player.setVelocityX(playerVelocity);
      if (this.player.body.onFloor()) {
        this.player.play("taneRun", true);
      }
    }
    // ---- Idle ----
    else {
      // If no keys are pressed, the player keeps still
      this.player.setVelocityX(0);
      // Only show the idle animation if the player is footed (If this is not included, the player would look idle while jumping)
      if (this.player.body.onFloor()) {
        this.player.play("taneIdle", true);
      }
    }
    // ---- Jump control ----
    if ((this.cursors.space.isDown || this.controls.upIsDown) && this.player.body.onFloor()) {
      //player is on the ground, so he is allowed to start a jump
      this.jumptimer = 1;
      this.player.body.velocity.y = playerJump;
      this.player.play("taneJump", false);

      // Jump sounds
      const random = Phaser.Math.Between(1, 9);
      switch (random) {
        case 1:
          this.sound.play("maleJump1");
          break;
        case 2:
          this.sound.play("maleJump2");
          break;
        case 3:
          this.sound.play("maleJump3");
          break;
        case 4:
          this.sound.play("maleJump4");
          break;
        case 5:
          this.sound.play("maleJump5");
          break;
        case 6:
          this.sound.play("maleJump6");
          break;
        case 7:
          this.sound.play("maleJump7");
          break;
        case 8:
          this.sound.play("maleJump8");
          break;
        case 9:
          this.sound.play("maleJump9");
          break;
        default:
          return;
      }
    }
    // Jump hold
    else if ((this.cursors.space.isDown || this.controls.upIsDown) && this.jumptimer != 0) {
      //player is no longer on the ground, but is still holding the jump key
      if (this.jumptimer > 30) {
        // player has been holding jump for over 30 frames, it's time to stop him
        this.jumptimer = 0;
        // this.player.play('taneJump', false);
      } else {
        // player is allowed to jump higher (not yet 30 frames of jumping)
        this.jumptimer++;
        this.player.body.velocity.y = playerJump;
        // this.player.play('taneJump', false);
      }
    } else if (this.jumptimer != 0) {
      //reset this.jumptimer since the player is no longer holding the jump key
      this.jumptimer = 0;
      // this.player.play('taneJump', false);
    }

    // flip player
    if (this.player.body.velocity.x > 0) {
      this.player.setFlipX(true);
    } else if (this.player.body.velocity.x < 0) {
      // otherwise, make them face the other side
      this.player.setFlipX(false);
    }

    // ability to wrap around sides (walk all the right and appear again on the left)
    this.horizontalWrap(this.player);

    // ============= DEATH BY FALLING ==============
    // get bottom most platform
    const bottomPlatform = this.findBottomMostPlatform(this.platformsFinished);
    // check if player has fallen below last platform
    if (this.player.y > bottomPlatform.y + 500) {
      console.log("you were too slow and bottom caught ya. you died.");
      this.deathBy = "falling";
      // player died
      this.scene.start("game-over", { deathBy: this.deathBy });
    }
  } // End of update()

  // ============= CUSTOM FUNCTIONS ==============
  moveHero(e) {
    // set hero velocity according to input horizontal coordinate
    this.player.setVelocityX(
      gameOptions.heroSpeed * (e.x > game.config.width / 2 ? 1 : -1)
    );

    // keyboard controller
    if ((this.cursors.left.isDown || this.controls.leftIsDown)) {
      this.player.setVelocityX(-300);
      this.player.play("taneRun");
    } else if ((this.cursors.right.isDown || this.controls.rightIsDown)) {
      this.player.setVelocityX(300);
      this.player.play("taneRun");
    } else {
      this.player.play("taneIdle", true);
    }
  }

  // method to stop the hero
  stopHero() {
    // ... just stop the hero :)
    this.player.setVelocityX(0);
  }

  findBottomMostPlatform(platformsFinished) {
    let platforms = null;
    if (platformsFinished == false) {
      platforms = this.platforms.getChildren();
    } else if (platformsFinished) {
      platforms = this.clouds.getChildren();
    }

    let bottomPlatform = platforms[0];

    for (let i = 1; i < platforms.length; ++i) {
      const platform = platforms[i];
      // discard any platforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  addLightningAbove(sprite) {
    const randomLightning = Phaser.Math.Between(1, 3);
    if (randomLightning !== 3) return
    const y = sprite.y;
    const randomX = Phaser.Math.Between(50, game.config.width - 50);
    // const lightning = this.lightning.get(sprite.x, y, "lightning");
    const lightning = this.lightning.get(randomX, y, "lightning");
    // lightning.body.velocity.setTo(0, 100);
    lightning.setOrigin(0, 0);
    lightning.setScale(2);
    lightning.setActive(true);
    lightning.setVisible(true);
    this.add.existing(lightning);
    lightning.body
      .setSize(lightning.width / 10, lightning.height - 30)
      .setOffset(17, 30);
    lightning.setDepth(1004);
    // play lightning animation
    lightning.play("lightning", true);
    // 2 lightning sounds
    const random = Phaser.Math.Between(1, 2);
    if (random == 1) {
      this.sound.play("lightning1");
    } else if (random == 2) {
      this.sound.play("lightning2");
    }
    return lightning;
  }

  addOrb(colour) {
    const x = Phaser.Math.Between(1, 540);
    const y = Phaser.Math.Between(-10000, 0);
    // get random number to determine which orb to randomly place
    // const random = Phaser.Math.Between(1, 2);
    switch (colour) {
      case "blue":
        const blueOrb = this.orbs.get(x, y, "blueOrb");
        blueOrb.setScale(2);
        blueOrb.setActive(true);
        blueOrb.setVisible(true);
        this.add.existing(blueOrb);
        blueOrb.body.setSize(blueOrb.width / 2, blueOrb.height / 2);
        blueOrb.play("blueOrb");
        blueOrb.setDepth(1005)
        return blueOrb;
        break;
      case "pink":
        const pinkOrb = this.orbs.get(x, y, "pinkOrb");
        pinkOrb.setScale(2);
        pinkOrb.setActive(true);
        pinkOrb.setVisible(true);
        this.add.existing(pinkOrb);
        pinkOrb.body.setSize(pinkOrb.width / 2, pinkOrb.height / 2);
        pinkOrb.play("pinkOrb");
        pinkOrb.setDepth(1005)
        return pinkOrb;
        break;
      default:
        return;
    }
  }

  handleLightningStrike() {
    console.log("you got zapped!");
    this.deathBy = "lightning";
    this.scene.start("game-over", { deathBy: this.deathBy });
  }

  handleCollectOrb(player, orb) {
    this.orbs.killAndHide(orb);
    this.physics.world.disableBody(orb.body);

    this.dreamCount++;
    this.sound.play("powerup");
    this.dreamsText.setText(`Dreams: ${this.dreamCount}`);
  }

  launchFireworks() {
    this.sound.play("fireworksSound");
    const bottomOfScreen = -11000 + 740;
    const rand1x = Phaser.Math.Between(0, game.config.width);
    const rand1y = Phaser.Math.Between(300, 740);
    const rand2x = Phaser.Math.Between(0, game.config.width);
    const rand2y = Phaser.Math.Between(300, 740);
    const fireworks = this.add
      .sprite(rand1x, bottomOfScreen, "fireworksRocket")
      .setDepth(1006);
    const fireworks1 = this.add
      .sprite(rand2x, bottomOfScreen, "fireworksRocket")
      .setDepth(1006);
    fireworks.play("fireworksRocket");
    this.tweens
      .add({
        targets: fireworks,
        y: bottomOfScreen - rand1y,
        duration: 2000,
        ease: "Power2",
      })
      .on("complete", (anim, frame) => {
        fireworks.setScale(2);
        fireworks.play("fireworksBlue");
      });
    this.tweens
      .add({
        targets: fireworks1,
        y: bottomOfScreen - rand2y,
        duration: 2500,
        ease: "Power2",
      })
      .on("complete", (anim, frame) => {
        fireworks1.setScale(2);
        fireworks1.play("fireworksBlue");
      });
  }

  // settings for the dialog labels
  createLabel(scene, text, spaceTop, spaceBottom) {
    return scene.rexUI.add.label({
      width: 40, // Minimum width of round-rectangle
      height: 40, // Minimum height of round-rectangle
      background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x8f80b6),
      text: scene.add
        .text(0, 0, text, {
          fontFamily: "Freckle Face",
          fontSize: "24px",
          color: "#ffffff",
        })
        .setShadow(2, 2, "#333333", 2, false, true)
        .setAlign("center"),
      space: {
        left: 10,
        right: 10,
        top: spaceTop,
        bottom: spaceBottom,
      },
    });
  }
}

var sceneConfig = {
  // ....
  pack: {
    files: [
      {
        type: "plugin",
        key: "rexwebfontloaderplugin",
        url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexwebfontloaderplugin.min.js",
        start: true,
      },
      {
        type: "image",
        key: "tc-logo",
        url: "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/all%20white.png?v=1649980778495",
      },
    ],
  },
};
class GameIntro extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  init(data) { }

  preload() {
    // loading bar
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;
    var loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 110,
      text: "Loading...",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });
    var madeByText = this.make.text({
      x: width / 2,
      y: height / 2 - 25,
      text: "game by",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });

    loadingText.setOrigin(0.5, 0.5);
    madeByText.setOrigin(0.5, 0.5);
    this.add
      .image(width / 2, height / 2 + 125, "tc-logo")
      .setDisplaySize(250, 250);
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(game.config.width / 2 - 320 / 2, 270, 320, 50);

    this.plugins.get("rexwebfontloaderplugin").addToScene(this);
    this.load.rexWebFont({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
    });

    this.load.image(
      "background",
      "https://cdn.glitch.com/f605c78d-cefb-481c-bb78-d09a6bffa1e6%2Fbg_layer1.png?v=1603601139028"
    );

    this.load.image(
      "kowhaiwhai",
      "https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Fkowhaiwhai.png?v=1609829230478"
    );

    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI"
    );

    this.load.spritesheet(
      "hiwa2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/hiwa-spritesheet-2.png?v=1649986716254",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "blueOrb",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/blue-orb-spritesheet.png?v=1649574549090",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.image(
      "background",
      "https://cdn.glitch.com/f605c78d-cefb-481c-bb78-d09a6bffa1e6%2Fbg_layer1.png?v=1603601139028"
    );

    this.load.image(
      "tc-logo",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/all%20white.png?v=1649980778495"
    );

    this.load.image(
      "kowhaiwhai",
      "https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Fkowhaiwhai.png?v=1609829230478"
    );
    // this.load.image(
    //   "bg1",
    //   "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/bg1.png?v=1649030866283"
    // );
    this.load.image(
      "bg1",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/bg1v2.png?v=1649667680599"
    );
    this.load.image(
      "bg2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/bg2.png?v=1649030866646"
    );
    this.load.image(
      "bg3",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/bg3.png?v=1649030867482"
    );
    this.load.image(
      "bg4",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/bg4.png?v=1649030866382"
    );
    this.load.image(
      "heaven",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/heaven.png?v=1649030866831"
    );
    this.load.image(
      "stars1",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/stars1.png?v=1649669917739"
    );
    this.load.image(
      "stars2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/stars2.png?v=1649669918099"
    );

    this.load.image(
      "planets",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/planets.png?v=1649671820210"
    );
    this.load.image(
      "heavenCloudsFront",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/heavenCloudsFront.png?v=1649671819828"
    );
    this.load.image(
      "heavenCloudsBack",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/heavenCloudsBack.png?v=1649671819866"
    );
    this.load.image(
      "cloud1",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/cloud1.png?v=1649822287079"
    );
    this.load.image(
      "cloud2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/cloud2.png?v=1649822287079"
    );
    this.load.image(
      "cloud3",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/cloud3.png?v=1649822287079"
    );
    this.load.image(
      "cloud4",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/cloud4.png?v=1649822287079"
    );

    this.load.image(
      "kowhaiwhai",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fkowhaiwhai.png?v=1609392792102"
    );
    this.load.image(
      "platform",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fground_grass.png?v=1603605919474"
    );

    // bee enemy
    this.load.atlasXML(
      "enemies",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fenemies.png?v=1603605920558",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fenemies.xml?v=1603606013060"
    );

    // Tāne
    this.load.image(
      "tane-stand",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Ftane-back-idle.png?v=1603605920848"
    );
    this.load.image(
      "tane-jump",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Ftane-back-jump.png?v=1603605921264"
    );
    this.load.image(
      "controls",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/controls.png?v=1652917774226"
    );

    // Audio
    // this.load.audio("jump", "assets/sfx/phaseJump1.wav");
    this.load.audio(
      "jump",
      // "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fquake-jump.ogg?v=1603606002409"
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fjump.ogg?v=1609392787230"
    );
    this.load.audio(
      "die",
      // "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fquake-die.ogg?v=1603606001864",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fdie.ogg?v=1609392786498"
    );
    this.load.audio(
      "hurt",
      // "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fquake-hurt.ogg?v=1603606002105"
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fbad.ogg?v=1609392786467"
    );
    this.load.audio(
      "death",
      // "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fquake-hurt.ogg?v=1603606002105"
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/death.mp3?v=1649896854596"
    );
    this.load.audio(
      "good",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fgood.ogg?v=1609392786967"
    );
    this.load.audio(
      "music",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fmusic.mp3?v=1609537055594"
    );
    this.load.audio(
      "end-music",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fgameover-music.mp3?v=1609537053554"
    );
    this.load.audio(
      "cheer",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fcheer.wav?v=1609537053752"
    );
    this.load.audio(
      "jump1",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%201%20-%20Sound%20effects%20Pack%202.wav?v=1649890484928"
    );
    this.load.audio(
      "lightning1",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Explosion%203%20-%20Sound%20effects%20Pack%202.wav?v=1649890485563"
    );
    this.load.audio(
      "lightning2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Explosion%205%20-%20Sound%20effects%20Pack%202.wav?v=1649890482815"
    );
    this.load.audio(
      "powerup",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Retro%20Event%20StereoUP%2002.wav?v=1649892494671"
    );
    this.load.audio(
      "falling",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Retro%20Descending%20Short%2020.wav?v=1649892479903"
    );
    this.load.audio(
      "maleJump1",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%202.wav?v=1649892575856"
    );
    this.load.audio(
      "maleJump2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%203.wav?v=1649892576040"
    );
    this.load.audio(
      "maleJump3",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%204.wav?v=1649892575908"
    );
    this.load.audio(
      "maleJump4",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%205.wav?v=1649892576222"
    );
    this.load.audio(
      "maleJump5",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%206.wav?v=1649892576326"
    );
    this.load.audio(
      "maleJump6",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%207.wav?v=1649892576626"
    );
    this.load.audio(
      "maleJump7",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%208.wav?v=1649892576839"
    );
    this.load.audio(
      "maleJump8",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%209.wav?v=1649892577079"
    );
    this.load.audio(
      "maleJump9",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Jump%2010.wav?v=1649892577316"
    );
    this.load.audio(
      "moaMusic",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Moa-Hunting-Tai-Collective.mp3?v=1649892321064"
    );
    this.load.audio(
      "fireworksSound",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/fireworks.wav?v=1649910586351"
    );
    this.load.audio(
      "dreamSound",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/dream-sound.wav?v=1650243851542"
    );

    // TANE !!! (From Ariki Creative)
    this.load.spritesheet(
      "taneIdle",
      "https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-idle.png?v=1606611069685",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "taneJump",
      "https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-jump.png?v=1606611070167",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "taneRun",
      "https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-run.png?v=1606611070188",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "blueOrb",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/blue-orb-spritesheet.png?v=1649574549090",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "pinkOrb",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/pink-orb-spritesheet.png?v=1649574533210",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "lightning",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/lightning-spritesheet.png?v=1649576960834",
      {
        frameWidth: 112,
        frameHeight: 112,
      }
    );
    this.load.spritesheet(
      "hiwa",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/hiwa-spritesheet.png?v=1649903657410",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "hiwa2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/hiwa-spritesheet-2.png?v=1649986716254",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "hiwaGive",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/hiwa-spritesheet-give.png?v=1650235363845",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "fireworksBlue",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Explosion_Crystals_Blue-sheet.png?v=1649907669760",
      {
        frameWidth: 88,
        frameHeight: 86,
      }
    );
    this.load.spritesheet(
      "fireworksBlue2",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Explosion_Long_Blue-sheet.png?v=1649907851908",
      {
        frameWidth: 80,
        frameHeight: 93,
      }
    );
    this.load.spritesheet(
      "fireworksRocket",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Rocket_Blue.png-sheet.png?v=1649908638368",
      {
        frameWidth: 7,
        frameHeight: 52,
      }
    );
    this.load.spritesheet(
      "dreamDiamond",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/dream-piece.png?v=1650241420024",
      {
        frameWidth: 480,
        frameHeight: 480,
      }
    );

    // Pre-loader
    this.load.on("progress", function (value) {
      console.log(value);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        game.config.width / 2 - 300 / 2,
        280,
        300 * value,
        30
      );
    });
    // this.load.on("fileprogress", function (file) {
    //   console.log(file.src);
    // });
    this.load.on("complete", function () {
      console.log("complete");
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    this.sound.stopAll();

    // intro background
    this.add.image(240, 320, "background").setScrollFactor(1, 0);
    this.add
      .tileSprite(
        game.config.width / 2,
        game.config.height / 2 + 500,
        game.config.width,
        3000,
        "kowhaiwhai"
      )
      .setScrollFactor(0, 0.25)
      .setAlpha(0.2)
      .setScale(1);

    // orb anitmation (for dialog 1)
    this.anims.create({
      key: "blueOrb",
      frames: "blueOrb",
      frameRate: 60,
      repeat: -1,
    });
    // hiwa anitmation (for dialog 2)
    this.anims.create({
      key: "hiwa2",
      frames: "hiwa2",
      frameRate: 5,
      repeat: -1,
    });

    // dialog ONE (Using rexUI)
    this.dialog1 = this.rexUI.add
      .dialog({
        x: game.config.width / 2,
        y: game.config.height / 2,
        width: 200,
        background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 10, 0x533d8e),
        content: this.createLabel(
          this,
          "Collect as many dream orbs as you can",
          20,
          20
        ),
        description: this.add
          .sprite({
            x: 0,
            y: 0,
            key: "blueOrb",
          })
          .play("blueOrb")
          .setDisplaySize(80, 80),
        actions: [this.createLabel(this, "NEXT", 10, 10)],
        space: {
          left: 20,
          right: 20,
          top: 50,
          bottom: 20,
          content: 20,
          toolbarItem: 5,
          choice: 15,
          action: 15,
          description: 25,
          descriptionLeft: 200,
          descriptionRight: 200,
        },
        align: {
          content: "center",
          description: "center",
          actions: "right", // 'center'|'left'|'right'
        },
        click: {
          mode: "release",
        },
      })
      .layout()
      // .drawBounds(this.add.graphics(), 0xff0000)
      .popUp(1000);

    // dialog TWO
    this.dialog2 = this.rexUI.add
      .dialog({
        x: game.config.width / 2,
        y: game.config.height / 2,
        width: 300,
        background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x533d8e),
        content: this.createLabel(
          this,
          "And deliver them to Hiwa-i-te-rangi \n to recieve a piece of your dream",
          10,
          10
        ),
        description: this.add.sprite(0, 0, "hiwa2").play("hiwa2"),
        actions: [this.createLabel(this, "START GAME", 10, 10)],
        space: {
          left: 20,
          right: 20,
          top: 50,
          bottom: 20,
          content: 20,
          toolbarItem: 5,
          choice: 15,
          action: 15,
          descriptionLeft: 200,
          descriptionRight: 200,
        },
        align: {
          content: "center",
          actions: "right", // 'center'|'left'|'right'
        },
        click: {
          mode: "release",
        },
      })
      .layout()
      // .drawBounds(this.add.graphics(), 0xff0000)
      .setVisible(false);

    var tween = this.tweens.add({
      targets: [this.dialog1, this.dialog2],
      scaleX: 1,
      scaleY: 1,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 1000,
      repeat: 0, // -1: infinity
      yoyo: false,
    });

    this.dialog1.on(
      "button.click",
      function (button) {
        if (button.text === "NEXT") {
          this.dialog1.setVisible(false);
          this.dialog2.setVisible(true).popUp(1000);
        }
      },
      this
    );

    this.dialog2.on(
      "button.click",
      function (button) {
        if (button.text === "START GAME") {
          console.log("starting game");
          this.scene.start("game");
          // this.scene.start("game-hud")
        }
      },
      this
    );
  }
  // settings for the dialog labels
  createLabel(scene, text, spaceTop, spaceBottom) {
    return scene.rexUI.add.label({
      width: 40, // Minimum width of round-rectangle
      height: 40, // Minimum height of round-rectangle
      background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x8f80b6),
      text: scene.add
        .text(0, 0, text, {
          fontFamily: "Freckle Face",
          fontSize: "24px",
          color: "#ffffff",
        })
        .setShadow(2, 2, "#333333", 2, false, true)
        .setAlign("center"),
      space: {
        left: 10,
        right: 10,
        top: spaceTop,
        bottom: spaceBottom,
      },
    });
  }
}
class GameOver extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  init(data) {
    this.deathBy = data.deathBy;
  }

  preload() {
    this.load.audio(
      "falling",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Retro%20Descending%20Short%2020.wav?v=1649892479903"
    );
    this.load.audio(
      "end-music",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fgameover-music.mp3?v=1609537053554"
    );
  }

  create() {
    this.sound.stopAll();

    if (this.deathBy == "falling") {
      this.sound.play("falling");
    } else if (this.deathBy == "lightning") {
      this.sound.play("death");
    }

    // load song
    const musicConfig = {
      volume: 0.5,
      loop: true,
      delay: 3000,
    };
    this.endMusic = this.sound.add("end-music", musicConfig);
    this.endMusic.play();

    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .tileSprite(
        game.config.width / 2,
        game.config.height / 2 + 500,
        game.config.width,
        3000,
        "kowhaiwhai"
      )
      .setScrollFactor(0, 0.25)
      .setAlpha(0.2)
      .setScale(1);

    WebFont.load({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
      active: () => {
        // game over
        this.gameOver = this.add
          .text(
            game.config.width / 2,
            game.config.height / 2 - 100,
            "Game Over",
            {
              fontFamily: "Freckle Face",
              fontSize: 50,
              color: "#ffffff",
            }
          )
          .setShadow(2, 2, "#333333", 2, false, true);
        this.gameOver.setAlign("center");
        this.gameOver.setOrigin();
        this.gameOver.setScrollFactor(0);

        // restart button
        this.pressRestart = this.add
          .text(
            game.config.width / 2,
            game.config.height / 2,
            "Restart Game",
            {
              fontFamily: "Finger Paint",
              fontSize: 20,
              color: "#ffffff",
            }
          )
          .setShadow(2, 2, "#333333", 2, false, true);
        this.pressRestart.setAlign("center");
        this.pressRestart.setOrigin();
        this.pressRestart.setScrollFactor(0);
        this.pressRestart.setInteractive()
        this.pressRestart.on('pointerdown', () => this.scene.start("game"));

        // quit button
        this.pressQuit = this.add
          .text(
            game.config.width / 2,
            game.config.height / 2 + 80,
            "Quit Game",
            {
              fontFamily: "Finger Paint",
              fontSize: 20,
              color: "#ffffff",
            }
          )
          .setShadow(2, 2, "#333333", 2, false, true);
        this.pressQuit.setAlign("center");
        this.pressQuit.setOrigin();
        this.pressQuit.setScrollFactor(0);
        this.pressQuit.setInteractive()
        this.pressQuit.on('pointerdown', () => {
          //TODO: @FFF quit back to app
          console.log("quit back to app")
        });


      },
    });


    // quit button

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("game");
    });
    // this.input.on("pointerdown", () => {
    //   this.scene.start("game");
    // });
  }
}

class YouWin extends Phaser.Scene {
  constructor() {
    super("you-win");
  }

  create() {
    this.camera.main.setBackgroundColor("#533d8e");

    this.sound.stopAll();
    // load song
    const musicConfig = {
      volume: 0.5,
      loop: false,
      delay: 3000,
    };
    this.cheer = this.sound.add("cheer", musicConfig);
    this.cheer.play();

    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .tileSprite(
        game.config.width / 2,
        game.config.height / 2 + 500,
        game.config.width,
        3000,
        "kowhaiwhai"
      )
      .setScrollFactor(0, 0.25)
      .setAlpha(0.2)
      .setScale(1);

    WebFont.load({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
      active: () => {
        this.gameOver = this.add
          .text(
            game.config.width / 2,
            game.config.height / 2 - 100,
            "You Win!",
            {
              fontFamily: "Freckle Face",
              fontSize: 50,
              color: "#ffffff",
            }
          )
          .setShadow(2, 2, "#333333", 2, false, true);
        this.gameOver.setAlign("center");
        this.gameOver.setOrigin();
        this.gameOver.setScrollFactor(0);

        this.add
          .text(
            game.config.width / 2,
            game.config.height / 2,
            "Tino pai to mahi.",
            {
              fontFamily: "Finger Paint",
              fontSize: 20,
              color: "#ffffff",
            }
          )
          .setShadow(2, 2, "#333333", 2, false, true)
          .setAlign("center")
          .setOrigin()
          .setScrollFactor(0);
        this.add
          .text(
            game.config.width / 2,
            game.config.height / 2 + 100,
            "You collected all the actions\n to complete this moemoeā.",
            {
              fontFamily: "Finger Paint",
              fontSize: 20,
              color: "#ffffff",
            }
          )
          .setShadow(2, 2, "#333333", 2, false, true)
          .setAlign("center")
          .setOrigin()
          .setScrollFactor(0);
      },
    });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("game");
    });
    this.input.on("pointerdown", () => {
      this.scene.start("game");
    });
  }
}

class Orb extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   */
  constructor(scene, x, y, texture = "orb") {
    super(scene, x, y, texture);

    this.setScale(0.5);
  }
}
