import * as Assets from '../assets';
import { runInThisContext } from 'vm';

export default class Opening extends Phaser.State {
  private debugTools = false;
  private bg: Phaser.Sprite;
  private pale_bg: Phaser.Sprite;
  private rbt: any;
  private crystal: any;
  private RABBITS: number;
  private CRYSTAL_RATE: number;
  private crystal_counter: number;
  private eagle: Phaser.Sprite;
  private eagleState: string;
  private eagleFront: Phaser.Sprite;
  private allWhite: Phaser.Sprite;
  private allBlack: Phaser.Sprite;
  private calls: number;
  private title: Phaser.Sprite;
  private psts: Phaser.Sprite;
  private cry: any;
  private bgm: any;
  public preload(): void {
  }

  public create(): void {
    // this.game.forceSingleUpdate = true;
    this.cry = this.game.add.audio(Assets.Audio.AudioEagleCry.getName());
    this.bgm = this.game.add.audio(Assets.Audio.Audio8bitBossa.getName());
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bg = this.game.add.sprite(0, 0, Assets.Images.ImagesOpeningBgColored.getName());
    this.pale_bg = this.game.add.sprite(0, 0, Assets.Images.ImagesOpeningBgPale.getName());
    this.pale_bg.visible = false;
    this.rbt = [];
    this.crystal = [];
    this.RABBITS = 12;
    this.CRYSTAL_RATE = 180;
    this.crystal_counter = 0;
    this.eagleState = 'nothing';
    this.calls = 0;

    // Chain of eagle events
    this.setUpEagleBack();
    this.prepareCrystal();
    /**/
    this.eagleFront = this.game.add.sprite(2000, 150, Assets.Spritesheets.SpritesheetsOpeningEagleFront50043812.getName());
    this.eagleFront.anchor.setTo(0, 1);
    /**/
    for (let i = 0; i < this.RABBITS; i++) this.addRbt(-10 + i * 2.5);
    // Optimize
    this.game.renderer.renderSession.roundPixels = true;
    this.allWhite = this.game.add.sprite(0, 0, Assets.Images.ImagesAllWhite.getName());
    this.allBlack = this.game.add.sprite(0, 0, Assets.Images.ImagesAllBlack.getName());
    this.allBlack.alpha = 0;
    this.allWhite.alpha = 0;
    this.title = this.game.add.sprite(1920 / 2, 450, Assets.Images.ImagesTitle.getName());
    this.title.alpha = 0;
    this.title.anchor.setTo(0.5);
    this.psts = this.game.add.sprite(1920 / 2, 900, Assets.Images.ImagesPsts.getName());
    this.psts.alpha = 0;
    this.psts.anchor.setTo(0.5);
    this.bgm.play('', 0, 1, true);
  }
  setUpEagleBack() {
    this.eagle = this.game.add.sprite(2000, 150, Assets.Spritesheets.SpritesheetsOpeningEagleBack50043812.getName());
    this.eagle.anchor.setTo(0, 1);
    this.eagle.animations.add('dive', [9, 10], 10, true, true);
    this.eagle.animations.add('fly', [5, 6, 7, 8], 8, true, true);
    this.eagle.animations.add('idle', [0], 1, true, true);

    this.eagle.animations.add('flyaway', [0, 1, 2, 3, 4, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8], 8, false, true); // 讓我不顧一切 無止盡追尋~~~~
    this.eagle.animations.play('dive');
    this.game.time.events.add(Phaser.Timer.SECOND * 8, function () { this.eagleState = 'dive1'; }, this);
  }
  EagleUpdate() {

    if (this.eagleState === 'dive1') {
      // var sec = 1 / this.game.time.elapsed;

      this.eagle.x -= 2600 / 70;
      this.eagle.y += 300 / 70;
      if (this.calls === 0) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 2, function () { this.eagleState = 'dive2'; }, this);
      }
    } else if (this.eagleState === 'dive2') {
      this.cry.play();
      this.eagleState = 'dive3';
      this.eagle.x = -150;
      this.eagle.y = 0;
      this.eagle.scale.setTo(-1, 1);

    } else if (this.eagleState === 'dive3') {
      let tgx = 1000; let tgy = 1185;
      this.eagle.x += (tgx - this.eagle.x) * 0.04;
      this.eagle.y += (tgy - this.eagle.y) * 0.04;
      if (this.calls === 1) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 2.5, function () { this.eagleState = 'idle'; }, this);
      }
    } else if (this.eagleState === 'idle') {
      // do nothing
      this.eagle.animations.play('idle');
      this.eagle.x = 1135;
      this.eagle.y = 1175;
      this.eagleState = 'silence';
    } else if (this.eagleState === 'silence') {
      if (this.calls === 2) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 1.5, function () { this.eagleState = 'allWhite'; }, this);
      }
    } else if (this.eagleState === 'allWhite') {
      this.allWhite.alpha = Math.min(0.02 + this.allWhite.alpha, 1);
      if (this.calls === 3) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 2.5, function () { this.eagleState = 'disappear'; }, this);
      }
    } else if (this.eagleState === 'disappear') {
      // change crystal pos
      for (let i = 0; i < 5; i++) {
        this.crystal[i].rotation = 0.65;
        this.crystal[i].x = 885;
        this.crystal[i].y = 1070;
      }
      // change char
      for (let i = 0; i < this.RABBITS; i++) {
        let newColor = [3, 7, 8];
        this.rbt[i].i = newColor[ this.game.rnd.integerInRange(0, 2) ];
        this.rbt[i].r.animations.play(`color${this.rbt[i].i}_${this.rbt[i].s}`);

      }
      // change bg
      this.pale_bg.visible = true;
      // change state
      this.eagleState = 'WUT';
    } else if (this.eagleState === 'WUT') {
      console.log(this.allWhite.alpha);
      this.allWhite.alpha = Math.max(0, this.allWhite.alpha - 0.01);
      if (this.calls === 4) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 3.5, function () { this.eagleState = 'flyaway'; }, this);
      }
    } else if (this.eagleState === 'flyaway') {
      this.allWhite.alpha = 0;
      if (this.eagle.animations.currentAnim.name !== 'flyaway') this.eagle.animations.play('flyaway');
      let speed = [0, 0, -2, -5, -12, 2, -3, -8, -5];
      this.eagle.y += speed[this.eagle.animations.frame] * 2.5;

      // calculate crystal offset
      let offsetX = [-260, -260, -315, -250, -245, -220, -220, -230, -232];
      let offsetY = [-105, -45,   -35, -75, -165, -100, -115, -120, -95];
      let rotation = [0.65, 0.72, 1.8, 0.65, 0.85, 0.58, 0.61, 0.95, 0.65];
      for (let i = 0; i < 5; i++) {
        this.crystal[i].x = this.eagle.x + offsetX[this.eagle.animations.frame];
        this.crystal[i].y = this.eagle.y + offsetY[this.eagle.animations.frame];
        this.crystal[i].rotation = rotation[this.eagle.animations.frame];
      }
      if (this.calls === 5) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 7, function () { this.eagleState = 'end'; }, this);
      }
    } else if (this.eagleState === 'end') {
      /*this.allBlack.alpha = Math.min(1, this.allBlack.alpha + 0.02);
      if(this.calls === 6) {
        this.calls++;
        this.game.time.events.add(Phaser.Timer.SECOND * 2.5, function () { this.game.state.start('game') }, this);
      }*/
      this.title.alpha  = Math.min((Math.sin(this.game.time.now / 500) + 1) / 2 * 0.4 + 0.3, this.title.alpha + 0.02);
      this.psts.alpha  = Math.min(0.5, this.psts.alpha + 0.02);
    }
    this.eagleFront.x = this.eagle.x;
    this.eagleFront.y = this.eagle.y;
    this.eagleFront.scale.x = this.eagle.scale.x;
    this.eagleFront.animations.frame = this.eagle.animations.frame;
  }
  prepareCrystal() {

    for (let i = 0; i < 5; i++) {
      let c = this.game.add.sprite(1920 / 2, 1135, Assets.Spritesheets.SpritesheetsCrystalsCrystal27336420.getName());
      c.anchor.setTo(0.5, 1);
      c.scale.setTo(0.5);
      c.animations.add('shine', [i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4, i * 4], 8, true, true);
      c.animations.play('shine');
      this.crystal.push(c);
    }
  }
  updateCrystal() {
    this.crystal_counter += 1;
    let x = this.crystal_counter % (this.CRYSTAL_RATE * 5);
    for (let i = 0; i < 5; i++) {
      if (i !== 0) this.crystal[i].alpha = Math.max(0, 1 - Math.abs(x - this.CRYSTAL_RATE * i) / this.CRYSTAL_RATE);
      else this.crystal[i].alpha = Math.max(0, x / this.CRYSTAL_RATE + 4, -x / this.CRYSTAL_RATE + 1);
    }
  }

  addRbt(yoffset: number) {
      let r = this.game.add.sprite(this.game.rnd.integerInRange(100, 1800), 1150 + yoffset, Assets.Spritesheets.SpritesheetsRabbitset20025045.getName());
      r.anchor.setTo(0.5, 1);
      r.scale.setTo(0.8);
      let speedBase = this.game.rnd.integerInRange(5, 15);
      for (let i = 0; i < 9; i++) {
        r.animations.add(`color${i}_walk`, [i * 5, i * 5 + 1, i * 5 + 2, i * 5 + 3, i * 5 + 4], speedBase, true, true);
        r.animations.add(`color${i}_idle`, [i * 5], 1, true, true);
      }
      let index = this.game.rnd.integerInRange(0, 8);
      let state = 'idle';
      r.animations.play(`color${index}_idle`);


      // random direction
      r.scale.x = this.game.rnd.integerInRange(0, 1) === 1 ? 0.8 : -0.8;
      // random size
      let rndScale = this.game.rnd.realInRange(0.6, 1.5);
      r.scale.x *= rndScale;
      r.scale.y *= rndScale;
      // random time to jump
      // random speed
      let speed = this.game.rnd.realInRange(0.25, 0.8) * speedBase * rndScale;
      this.rbt.push({r: r, i: index, s: state, speed: speed});

  }
  updateRbt(rbt: any) {
    if (rbt.s === 'walk') {
        let f = rbt.r.animations.frame % 5;
        if (f === 0) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.3;
        if (f === 1) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.5;
        if (f === 2) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -1.1;
        if (f === 3) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.7;
        if (f === 4) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.5;
        // random turnaround and forced turnarounds
        if (rbt.r.x < -100) rbt.r.scale.x = -Math.abs(rbt.r.scale.x);
        else if (rbt.r.x > 1950) rbt.r.scale.x = Math.abs(rbt.r.scale.x);
        else {
          if (this.game.rnd.realInRange(0, 1) < 0.01) {
            rbt.s = 'idle';
            rbt.r.animations.play(`color${rbt.i}_idle`);
          }
        }
        // random stops
    } else if (rbt.s === 'idle') {
        this.game.time.events.add(Phaser.Timer.SECOND * this.game.rnd.realInRange(0.01, 8.0), function (target: any) { target.s = 'walk'; target.r.animations.play(`color${target.i}_walk`); }, this, rbt);
    }
  }
  update(): void {
    for (let i = 0; i < this.RABBITS; i++) this.updateRbt(this.rbt[i]);
    this.updateCrystal();
    this.EagleUpdate();
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.bgm.stop();
      this.game.state.start('game');
    }
  }
  render(): void {
    if (this.debugTools)
      this.game.debug.text(this.game.time.fps.toString(), 20, 60, '#00ff00', '40pt Consolas');
  }
  public postUpdate(): void {

  }
}