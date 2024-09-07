import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import Phaser from 'phaser';
import { SlotMachineScene } from './SlotMachineScene'; // Adjust the import path if necessary

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.css']
})
export class SlotMachineComponent implements OnInit, OnDestroy {
  private phaserGame!: Phaser.Game;
  private config!: Phaser.Types.Core.GameConfig;
  private gameWidth: number;
  private gameHeight: number;

  constructor() {
    // Initialize dimensions based on window size
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;
  }

  ngOnInit(): void {
    // Configure Phaser game
    this.config = {
      type: Phaser.AUTO,
      width: this.gameWidth,
      height: this.gameHeight,
      scene: SlotMachineScene // Use the custom scene here
    };

    // Initialize Phaser game
    this.phaserGame = new Phaser.Game(this.config);

    // Listen for window resize events
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    // Destroy Phaser game instance when component is destroyed
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
    }

    // Remove resize event listener
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private onResize(): void {
    // Update game dimensions based on new window size
    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;

    if (this.phaserGame) {
      this.phaserGame.scale.resize(this.gameWidth, this.gameHeight);
    }
  }
}
