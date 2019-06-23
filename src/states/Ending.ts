import * as Assets from '../assets';
import { runInThisContext } from 'vm';

export default class Ending extends Phaser.State {
  private debugTools = false;
  private bg: Phaser.Sprite;
  private rbt: any;
  private crystal: any;
  private RABBITS: number;
  private CRYSTAL_RATE: number;
  private crystal_counter: number;
  private allWhite: Phaser.Sprite;
  private bgm: any;
  public preload(): void {
    if (this.debugTools)
      this.game.add.plugin(new Phaser.Plugin.Debug(this.game, this.game.plugins));
  }

  public create(): void {
    // this.game.forceSingleUpdate = true;
    this.bgm = this.game.add.audio(Assets.Audio.AudioSmallThings.getName());
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bg = this.game.add.sprite(0, 0, Assets.Images.ImagesOpeningBgColored.getName());
    this.rbt = [];
    this.crystal = [];
    this.RABBITS = 12;
    this.CRYSTAL_RATE = 180
    this.crystal_counter = 0;
    this.calls = 0;
    
    // Chain of eagle events
    this.prepareCrystal();
    /**/

    /**/
    for(var i = 0; i < this.RABBITS; i++) this.addRbt(-10 + i * 2.5);
    // Optimize
    this.game.renderer.renderSession.roundPixels = true;
    this.allWhite = this.game.add.sprite(0, 0, Assets.Images.ImagesAllWhite.getName());
    this.allWhite.alpha = 1;
    this.bgm.play('', 0, 1, true);
  }
  prepareCrystal() {
    
    for (var i = 0; i < 5; i++) {
      var c = this.game.add.sprite(1920/2, 1135, Assets.Spritesheets.SpritesheetsCrystalsCrystal27336420.getName());
      c.anchor.setTo(0.5, 1);
      c.scale.setTo(0.5);
      c.animations.add('shine', [i*4, i*4+1, i*4+2, i*4+3, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4, i*4], 8, true, true);
      c.animations.play('shine');
      this.crystal.push(c);
    }
  }
  updateCrystal() {
    this.crystal_counter += 1;
    let x = this.crystal_counter % (this.CRYSTAL_RATE * 5);
    for(var i = 0; i < 5; i++) {
      if(i != 0) this.crystal[i].alpha = Math.max(0, 1-Math.abs(x - this.CRYSTAL_RATE * i)/this.CRYSTAL_RATE);
      else this.crystal[i].alpha = Math.max(0, x/this.CRYSTAL_RATE+4, -x/this.CRYSTAL_RATE+1);
    }
  }

  addRbt(yoffset: number) {
      var r = this.game.add.sprite(this.game.rnd.integerInRange(100, 1800), 1150 + yoffset, Assets.Spritesheets.SpritesheetsRabbitset20025045.getName());
      r.anchor.setTo(0.5, 1);
      r.scale.setTo(0.8);
      let speedBase = this.game.rnd.integerInRange(5, 15);
      for(var i = 0; i < 9; i++)
      {
        r.animations.add(`color${i}_walk`, [i*5, i*5+1, i*5+2, i*5+3, i*5+4], speedBase, true, true);
        r.animations.add(`color${i}_idle`, [i*5], 1, true, true);
      }
      let index = this.game.rnd.integerInRange(0, 8);
      let state = 'idle';
      r.animations.play(`color${index}_idle`);
      
      
      // random direction
      r.scale.x = this.game.rnd.integerInRange(0, 1) == 1 ? 0.8 : -0.8;
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
    if(rbt.s == 'walk') {
        let f = rbt.r.animations.frame % 5;
        if(f == 0) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.3;
        if(f == 1) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.5;
        if(f == 2) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -1.1;
        if(f == 3) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.7;
        if(f == 4) rbt.r.x += Math.sign(rbt.r.scale.x) * rbt.speed * -0.5;
        // random turnaround and forced turnarounds
        if(rbt.r.x < -100) rbt.r.scale.x = -Math.abs(rbt.r.scale.x);
        else if(rbt.r.x > 1950) rbt.r.scale.x = Math.abs(rbt.r.scale.x);
        else {
          if(this.game.rnd.realInRange(0, 1) < 0.01) {
            rbt.s = 'idle';
            rbt.r.animations.play(`color${rbt.i}_idle`);
          }
        }
        // random stops
    } else if (rbt.s == 'idle') {
        this.game.time.events.add(Phaser.Timer.SECOND * this.game.rnd.realInRange(0.01, 8.0), function (target: any) { target.s='walk'; target.r.animations.play(`color${target.i}_walk`)}, this, rbt);
    }
  }
  update(): void {
	this.allWhite.alpha = Math.max(0, this.allWhite.alpha - 0.02);
    for(var i = 0; i < this.RABBITS; i++) this.updateRbt(this.rbt[i]);
    this.updateCrystal();
  }
  render(): void {
    if (this.debugTools)
      this.game.debug.text(this.game.time.fps.toString(), 20, 60, "#00ff00", "40pt Consolas");
  }
  public postUpdate(): void {

  }
}