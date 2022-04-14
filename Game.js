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
      height: 720,
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
    scene: [Game, GameOver, YouWin],
  };
  game = new Phaser.Game(gameConfig);
  window.focus();
};
class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.lives = 3;
    this.dreamCount = 0;
    this.tokenGoal = "";
    this.platformsFinished = false
    this.deathBy=""
  }

  preload() {
    this.load.image(
      "background",
      "https://cdn.glitch.com/e46a9959-9af7-4acd-a785-ff3bc76f44d0%2Fbg_layer1.png?v=1603605919212"
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

    // TANE !!! (From Ariki Creative)
    this.load.spritesheet('taneIdle',
      'https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-idle.png?v=1606611069685', {
        frameWidth: 128,
        frameHeight: 128
      }
    );

    this.load.spritesheet('taneJump',
      'https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-jump.png?v=1606611070167', {
        frameWidth: 128,
        frameHeight: 128
      }
    );
    this.load.spritesheet('taneRun',
      'https://cdn.glitch.com/cd67e3a9-81c5-485d-bf8a-852d63395343%2Ftane-run.png?v=1606611070188', {
        frameWidth: 128,
        frameHeight: 128
      }
    );
    this.load.spritesheet('blueOrb',
      'https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/blue-orb-spritesheet.png?v=1649574549090', {
        frameWidth: 32,
        frameHeight: 32
      }
    );
    this.load.spritesheet('pinkOrb',
      'https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/pink-orb-spritesheet.png?v=1649574533210', {
        frameWidth: 32,
        frameHeight: 32
      }
    );
    this.load.spritesheet('lightning',
      'https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/lightning-spritesheet.png?v=1649576960834', {
        frameWidth: 112,
        frameHeight: 112
      }
    );

    this.cursors = this.input.keyboard.createCursorKeys();

    //  Load the Google WebFont Loader script
    this.load.script(
      "webfont",
      "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js"
    );

    // rexUI plugin
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI"
    );
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
    WebFont.load({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
      active: () => {
        this.livesText = this.add
          .text(420, 50, "Lives: " + this.lives, {
            fontFamily: "Freckle Face",
            fontSize: 50,
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
        this.livesText.setAlign("right");
        this.livesText.setOrigin();
        this.livesText.setScrollFactor(0);
      },
    });
    // Orbs (text)
    WebFont.load({
      google: {
        families: ["Freckle Face", "Finger Paint", "Nosifer"],
      },
      active: () => {
        this.dreamsText = this.add
          .text(140, 50, "Dreams: " + this.dreamCount, {
            fontFamily: "Freckle Face",
            fontSize: 50,
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
        this.dreamsText.setAlign("center");
        this.dreamsText.setOrigin();
        this.dreamsText.setScrollFactor(0);
      },
    });

    // ================= BACKGROUND LAYERS =================
    this.backdrop = this.add.image(300, -5000, "bg1");
    this.add.image(300, -3400, "bg2").setScrollFactor(0.8);
    this.add.image(300, -3600, "bg3").setScrollFactor(0.9);
    // this.add.image(300, -3400, "bg4").setScrollFactor(0.7);
    this.add.image(300, -2700, "stars1").setScrollFactor(0.5).setScale(0.6);
    this.add.image(300, -2800, "stars2").setScrollFactor(0.6).setScale(0.5);
    this.planets = this.add.image(300, -5300, "planets").setScrollFactor(0.5);
    this.add.image(350, -4720, "heavenCloudsBack").setScrollFactor(0.48);
    this.add.image(100, -5100 , "heavenCloudsFront").setScrollFactor(0.52);
    console.log('this.backdrop',this.backdrop);
    console.log('this.planets',this.planets);

    // this.add
    //   .tileSprite(
    //     game.config.width / 2,
    //     game.config.height / 2,
    //     game.config.width,
    //     3000,
    //     "kowhaiwhai"
    //   )
    //   .setScrollFactor(0, 0.25)
    //   .setAlpha(0.2)
    //   .setScale(1);

    // ================= PLATFORMS =================
    this.platforms = this.physics.add.staticGroup();
    this.clouds = this.physics.add.staticGroup()
    // this.clouds = this.physics.add.group({
    //   allowGravity: false,
    //   immovable: true
    // });

    let firstPlatform = true;

    // ================== PLATFORMS ==================
    // then create 5 platforms from the group
    for (let i = 0; i < 5; ++i) {
      let x = Phaser.Math.Between(80, 400); //320
      const y = 154 * i;
      // const y = -5500 + (Phaser.Math.Between(160, 170 ) * i);

      // make sure first platform is below tane
      if (i == 4 && firstPlatform == true) {
        firstPlatform = false;
        // middle of screen(ish)
        x = game.config.width / 2 - 40;
      }

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.2;

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();
    }
    // ================== CLOUDS ==================
    for (let i = 0; i < 5; ++i) {
      const cloudNames = ["cloud1","cloud2","cloud3","cloud4"]
      let x = Phaser.Math.Between(80, 400); //320
      let rand = Phaser.Math.Between(0, 3); //320
      const y = -4000 + ( 154 * i);
      // const y = -5500 + (Phaser.Math.Between(160, 170 ) * i);

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const cloud = this.clouds.create(x, y, cloudNames[rand]);
      cloud.scale = 0.3;
      cloud.body.setSize(cloud.width, 10).setOffset(0,cloud.height)
      cloud.setDepth(1000)
      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = cloud.body;
      body.updateFromGameObject();
    }

    // this.cameras.main.scrollY = -8000
    // this.cameras.main.scrollY = -9500
    // this.cameras.main.scrollY = -5500

    // ================= PLAYER =================
    this.player = this.physics.add
      .sprite(240, 320, "taneIdle")

    // this.player = this.physics.add
    //   .sprite(240, -5500, "taneIdle")
      // .setScale(0.08);

    this.player.body.setSize(30, 70).setOffset(50, 30);
    this.physics.add.collider(this.platforms, this.player);
    this.physics.add.collider(this.clouds, this.player);

    // this.startPlatform = this.platforms.create(this.player.x, this.player.y + 120, "platform").setScale(0.2);
    // const body = this.startPlatform.body;
    // body.updateFromGameObject() ;

    // this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    //================ ANIMATIONS =================
    this.anims.create({
      key: "bee",
      frames: [
        {
          key: "enemies",
          frame: "bee.png",
        },
        {
          key: "enemies",
          frame: "bee_fly.png",
        },
      ],
      frameRate: 8,
      repeat: -1,
    });
    //coins anims
    this.anims.create({
      key: "blueCoin",
      frames: [
        { key: "blue-coin-1", frame: 0 },
        { key: "blue-coin-2", frame: 0 },
        { key: "blue-coin-3", frame: 0 },
        { key: "blue-coin-4", frame: 0 },
        { key: "blue-coin-5", frame: 0 },
        { key: "blue-coin-6", frame: 0 },
      ],
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "goldCoin",
      frames: [
        { key: "gold-coin-1", frame: 0 },
        { key: "gold-coin-2", frame: 0 },
        { key: "gold-coin-3", frame: 0 },
        { key: "gold-coin-4", frame: 0 },
        { key: "gold-coin-5", frame: 0 },
        { key: "gold-coin-6", frame: 0 },
      ],
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "silverCoin",
      frames: [
        { key: "silver-coin-1", frame: 0 },
        { key: "silver-coin-2", frame: 0 },
        { key: "silver-coin-3", frame: 0 },
        { key: "silver-coin-4", frame: 0 },
        { key: "silver-coin-5", frame: 0 },
        { key: "silver-coin-6", frame: 0 },
      ],
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "bronzeCoin",
      frames: [
        { key: "bronze-coin-1", frame: 0 },
        { key: "bronze-coin-2", frame: 0 },
        { key: "bronze-coin-3", frame: 0 },
        { key: "bronze-coin-4", frame: 0 },
        { key: "bronze-coin-5", frame: 0 },
        { key: "bronze-coin-6", frame: 0 },
      ],
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'taneRun',
      frames: this.anims.generateFrameNumbers('taneRun', {
        frames: [16, 17, 18, 19, 20, 21, 22, 23]
      }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'taneIdle',
      frames: this.anims.generateFrameNumbers('taneIdle', {
        frames: [0, 1, 2]
      }),
      frameRate: 5,
    });

    this.anims.create({
      key: 'taneJump',
      frames: this.anims.generateFrameNumbers('taneJump', {
        frames: [12, 13, 14, 15]
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: 'blueOrb',
      frames: 'blueOrb',
      frameRate: 60,
      repeat: -1,
    });
    this.anims.create({
      key: 'pinkOrb',
      frames: 'pinkOrb',
      frameRate: 60,
      repeat: -1
    });
    this.anims.create({
      key: 'lightning',
      frames: 'lightning',
      frameRate: 15,
      repeat: -1 
    });

        // ================= GROUPS =================
        this.orbs = this.physics.add.group({
          classType: Orb,
          allowGravity: false,
          immovable: true
        });
        this.lightning = this.physics.add.group({
          classType: Orb,
          allowGravity: true,
          immovable: false
        });
    
        // ================= DREAM ORBS =================
        // create orbs
        for(var x = 0; x < 10; x++) {
          this.addOrb("blue")
        }
        for(var x = 0; x < 10; x++) {
          this.addOrb("pink")
        }

        
// ================= OVERLAPS =================
    // this.physics.add.collider(this.platforms, this.orbs);
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
    
  // rotate orbs
  // this.orbs.children.iterate((orb) => {
  //   console.log("orb",orb.x,orb.y)
  //   Phaser.Actions.RotateAround(orb, {x: orb.x, y: orb.y }, 0.02);
  // })
  // Phaser.Actions.RotateAroundDistance(this.orbs.getChildren(), {   x: 250, y: -400 }, 0.02, 50);

    // camera moving  up    
    if (this.cameras.main.scrollY > -11000) {
      this.cameras.main.scrollY -= 1.5
     }

    const scrollY = this.cameras.main.scrollY;
    
    // ============= UPDATE PLATFORMS ==============
    // stop placing platforms from -500 scrollY
    if(scrollY < -3500 && this.platformsFinished == false) {
      this.platformsFinished=true
      this.player.body.setOffset(50, 20);
    } else if (this.platformsFinished == false) {
       // update platforms 
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      // add new platforms above once platforms disappear below bottom line.      
      if (platform.y >= scrollY + 750) {
        // if platform is 750 below current scrollY
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

        console.log('scrollY',scrollY," playerY",this.player.y);
        console.log('cloudY',cloud.y," limitY",scrollY + 750);
        // add new clouds above once clouds disappear below bottom line.      
        if (cloud.y >= scrollY + 750) {
          // if cloud is 750 below current scrollY
          cloud.y = scrollY - Phaser.Math.Between(50, 70); // random new y position relative to scrollY
          cloud.x = Phaser.Math.Between(0, game.config.width); // random new x position
          cloud.body.updateFromGameObject(); // update position
          this.addLightningAbove(cloud); // add Lightning
        }
      });
    }

   
    // update clouds 

   

    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {}

    const playerJump = -310
    const playerVelocity = 300
    
    // Control the player with left or right keys
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerVelocity);
      if (this.player.body.onFloor()) {
        this.player.play('taneRun', true);
      }
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerVelocity);
      if (this.player.body.onFloor()) {
        this.player.play('taneRun', true);
      }
    } else {
      // If no keys are pressed, the player keeps still
      this.player.setVelocityX(0);
      // Only show the idle animation if the player is footed
      // If this is not included, the player would look idle while jumping
      if (this.player.body.onFloor()) {
        this.player.play('taneIdle', true);
      }
    }

    // Player can jump while walking any direction by pressing the space bar
    // or the 'UP' arrow
    // === JUMP
    // if ((this.cursors.space.isDown || this.cursors.up.isDown ) && this.player.body.onFloor() ) {
    //   this.player.setVelocityY(-350);
    //   this.player.play('jump', true);
    // }
    if (this.cursors.space.isDown && this.player.body.onFloor()) {
      //player is on the ground, so he is allowed to start a jump
      this.jumptimer = 1;
      this.player.body.velocity.y = playerJump;
      this.player.play('taneJump', false);
      
      // Jump sounds
      // this.sound.play("jump1"); 
      const random = Phaser.Math.Between(1, 9)
      switch (random) {
        case 1:
          this.sound.play("maleJump1"); 
          break
        case 2:
          this.sound.play("maleJump2"); 
          break
        case 3:
          this.sound.play("maleJump3"); 
          break
        case 4:
          this.sound.play("maleJump4"); 
          break
        case 5:
          this.sound.play("maleJump5"); 
          break
        case 6:
          this.sound.play("maleJump6"); 
          break
        case 7:
          this.sound.play("maleJump7"); 
          break
        case 8:
          this.sound.play("maleJump8"); 
          break
        case 9:
          this.sound.play("maleJump9"); 
          break
        default:
          return;
      }

    } else if (this.cursors.space.isDown && (this.jumptimer != 0)) {
      //player is no longer on the ground, but is still holding the jump key
      if (this.jumptimer > 30) { // player has been holding jump for over 30 frames, it's time to stop him
        this.jumptimer = 0;
        // this.player.play('taneJump', false);
      } else { // player is allowed to jump higher (not yet 30 frames of jumping)
        this.jumptimer++;
        this.player.body.velocity.y = playerJump;
        // this.player.play('taneJump', false);
      }
    } else if (this.jumptimer != 0) { //reset this.jumptimer since the player is no longer holding the jump key
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



    this.horizontalWrap(this.player);

    const bottomPlatform = this.findBottomMostPlatform(this.platformsFinished);
    console.log("bottom platform:",bottomPlatform.y)

    // death by falling
    if (this.player.y > bottomPlatform.y + 500) {
      console.log('you were too slow and bottom caught ya. you died.');
      this.deathBy = "falling"
      this.scene.start("game-over",{deathBy: this.deathBy});
    }
  }

  findBottomMostPlatform(platformsFinished) {
    // console.log('got bottom'); 
    let platforms = null
    if (platformsFinished == false) {
      platforms = this.platforms.getChildren();
    } else if (platformsFinished) {
      platforms = this.clouds.getChildren() ;
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
    // console.log('bottom platform',bottomPlatform);

    return bottomPlatform;
  }

  /**
   *
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  /**
   *
   * @param {Phaser.GameObjects.Sprite} sprite
   */

  addLightningAbove(sprite) {
    // set token y position
    // const y = sprite.y - sprite.displayHeight;
    const y = sprite.y;
        const lightning = this.lightning.get(sprite.x, y, "lightning");
        lightning.setScale(2)
        lightning.setActive(true);
        lightning.setVisible(true);
        this.add.existing(lightning);
        lightning.body.setSize(lightning.width/10 , lightning.height-30).setOffset(17,30);
        // lightning.play("goldCoin", true);
        lightning.play("lightning", true);
        const random = Phaser.Math.Between(1, 2);
        console.log('lightning random:',random)
        if (random == 1) {
          this.sound.play("lightning1");
        } else if (random == 2) {
        this.sound.play("lightning2");
        }
        // this.physics.world.enable(lightning);
        return lightning;
      
   
  }
  addOrb(colour) {
    // set token y position
    // const y = sprite.y - sprite.displayHeight;
    const x = Phaser.Math.Between(1, 540);
    const y = Phaser.Math.Between(-10000, 0);
    // get random number to determine which token to randomly place
    const random = Phaser.Math.Between(1, 2);

    switch (colour) {
      case "blue":
        const blueOrb = this.orbs.get(x, y, "blueOrb");
        blueOrb.setScale(2)
        blueOrb.setActive(true);
        blueOrb.setVisible(true);
        this.add.existing(blueOrb);
        blueOrb.body.setSize(blueOrb.width/2, blueOrb.height/2);
        // blueOrb.play("goldCoin", true);
        blueOrb.play("blueOrb"); 
        // this.physics.world.enable(blueOrb);
        return blueOrb;
        break;
      case "pink":
        const pinkOrb = this.orbs.get(x, y, "pinkOrb");
        pinkOrb.setScale(2)
        pinkOrb.setActive(true);
        pinkOrb.setVisible(true);
        this.add.existing(pinkOrb);
        pinkOrb.body.setSize(pinkOrb.width/2, pinkOrb.height/2);
        // pinkOrb.play("silverCoin", true);
        pinkOrb.play("pinkOrb");
        // this.physics.world.enable(pinkOrb);
        return pinkOrb;
        break;
      default:
        return;
    }
  }

  /**
   *
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Orb} orb
   */
  handleLightningStrike() {
    console.log('you got zapped!');
    this.lives--
     if (this.lives <= 1) {
      this.deathBy = "lightning"
      this.scene.start("game-over",{deathBy: this.deathBy});
     }
  }

  handleCollectOrb(player, orb) {
    // if (this.lives <= 1) {
    //   this.scene.start("game-over");
    //   // this.sound.play("die");
    // }

    // remove touched token
    this.orbs.killAndHide(orb);
    this.physics.world.disableBody(orb.body);

    this.dreamCount++
      this.sound.play("powerup");
      this.dreamsText.setText(`Dreams: ${this.dreamCount}`);

  }

 

  moveHero(e) {
    // set hero velocity according to input horizontal coordinate
    this.player.setVelocityX(
      gameOptions.heroSpeed * (e.x > game.config.width / 2 ? 1 : -1)
    );

    // keyboard controller
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
      this.player.play("taneRun")
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
      this.player.play("taneRun")
    } else {
      this.player.play("taneIdle",true)
    }
  }

  // method to stop the hero
  stopHero() {
    // ... just stop the hero :)
    this.player.setVelocityX(0);
  }
}

class GameOver extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  init(data) {
    this.deathBy = data.deathBy
  }

  preload() {
    this.load.audio(
      "falling",
      "https://cdn.glitch.global/d000a9ec-7a88-4c14-9cdd-f194575da68e/Retro%20Descending%20Short%2020.wav?v=1649892479903"
    );
  }

  create() {
    this.sound.stopAll();


    if (this.deathBy == "falling") {
      this.sound.play("falling")
    } else if (this.deathBy == "lightning") {
      this.sound.play("death")
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

        this.pressRestart = this.add
          .text(
            game.config.width / 2,
            game.config.height / 2,
            "Press Space to Restart",
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
