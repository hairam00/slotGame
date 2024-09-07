import { Component, OnInit, OnDestroy } from '@angular/core';
import Phaser from 'phaser';
import { SlotMachineScene } from './SlotMachineScene'; // Adjust the import path if necessary

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.css']
})
export class SlotMachineComponent implements OnInit, OnDestroy {
  private phaserGame!: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;

  constructor() {
    // Phaser game configuration
    this.config = {
      type: Phaser.AUTO,
      width: 1900,
      height: 840,
      scene: SlotMachineScene // Use the custom scene here
    };
  }

  ngOnInit(): void {
    // Initialize Phaser game when component initializes
    this.phaserGame = new Phaser.Game(this.config);
  }

  ngOnDestroy(): void {
    // Destroy Phaser game instance when component is destroyed
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
    }
  }
}
