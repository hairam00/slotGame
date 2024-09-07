import Phaser from 'phaser';

export class SlotMachineScene extends Phaser.Scene {
    private reels: Phaser.GameObjects.Sprite[][] = [];
    private startX: number = 0;
    private startY: number = 0;
    private reelWidth: number = 0;
    private reelHeight: number = 0;
    private xSpacing: number = 0;
    private ySpacing: number = 0;

    private symbols: string[] = ['symbol1', 'symbol2', 'symbol3'];
    private winningCombinations: string[][] = [
        ['symbol1', 'symbol1', 'symbol1'],
        ['symbol2', 'symbol2', 'symbol2'],
        ['symbol3', 'symbol3', 'symbol3']
    ];
    private winningRatio: number = 100;
    private credits: number = 1000;
    private betAmount: number = 10;

    private spinButton!: Phaser.GameObjects.Sprite;
    private creditsBox!: Phaser.GameObjects.Graphics;
    private creditsText!: Phaser.GameObjects.Text;
    private reelsBox!: Phaser.GameObjects.Graphics;
    private spinning: boolean = false;

    constructor() {
        super({ key: 'SlotMachineScene' });
    }

    preload(): void {
        console.log('Preloading assets...');
        this.load.image('background', 'assets/background.jpg');
        this.load.image('spinButton', 'assets/spin.png');
        this.load.image('symbol1', 'assets/symbol1.png');
        this.load.image('symbol2', 'assets/symbol2.png');
        this.load.image('symbol3', 'assets/symbol3.png');
    }

    create(): void {
        console.log('Creating game scene...');
        this.updateLayout();
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background').setOrigin(0.5, 0.5);
        this.createReelsBox();
        this.initializeReels();
        this.addSpinButton();
        this.createCreditsBox();
        this.updateCreditsDisplay();
    }

    private updateLayout(): void {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        this.reelWidth = gameWidth * 0.2;
        this.reelHeight = gameHeight * 0.4;
        this.xSpacing = this.reelWidth * 0.2;
        this.ySpacing = this.reelHeight * 0.1;

        this.startX = (gameWidth - (this.reelWidth + this.xSpacing) * 3) / 2;
        this.startY = (gameHeight - (this.reelHeight + this.ySpacing) * 3) / 2;
    }

    private createReelsBox(): void {
        const boxWidth = this.reelWidth * 3 + this.xSpacing * 2;
        const boxHeight = this.reelHeight * 3 + this.ySpacing * 2;
        const boxX = this.startX - 10; // Padding around the box
        const boxY = this.startY - 10;

        // Create a box with casino-themed design
        this.reelsBox = this.add.graphics();
        this.reelsBox.fillStyle(0x000000, 0.8); // Semi-transparent black background
        this.reelsBox.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.reelsBox.lineStyle(4, 0xffd700, 1); // Gold border
        this.reelsBox.strokeRect(boxX, boxY, boxWidth, boxHeight);
    }

    private initializeReels(): void {
        const numRows = 3;
        const numCols = 3;

        for (let row = 0; row < numRows; row++) {
            this.reels[row] = [];
            for (let col = 0; col < numCols; col++) {
                const x = this.startX + col * (this.reelWidth + this.xSpacing);
                const y = this.startY + row * (this.reelHeight + this.ySpacing);
                const reel = this.add.sprite(x, y, 'symbol1');
                this.reels[row].push(reel);
            }
        }
    }

    private addSpinButton(): void {
        const buttonWidth = 100; // Adjust width of the spin button
        const buttonHeight = 120; // Adjust height of the spin button
        this.spinButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.height - buttonHeight / 2, 'spinButton').setInteractive();
        this.spinButton.on('pointerdown', () => {
            if (!this.spinning && this.credits >= this.betAmount) {
                console.log('Spin button clicked!');
                this.spinReels();
            }
        });
    }
    
    private createCreditsBox(): void {
        const boxWidth = 200;
        const boxHeight = 100;
        const boxX = 20; // Positioned at the bottom-left corner
        const boxY = this.cameras.main.height - boxHeight - 20;

        // Create a box with casino-themed design
        this.creditsBox = this.add.graphics();
        this.creditsBox.fillStyle(0x000000, 0.8); // Semi-transparent black background
        this.creditsBox.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.creditsBox.lineStyle(4, 0xffd700, 1); // Gold border
        this.creditsBox.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Add the credits text inside the box
        this.creditsText = this.add.text(boxX + boxWidth / 2, boxY + boxHeight / 2, `Credits: ${this.credits}`, {
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
    }

    private updateCreditsDisplay(): void {
        this.creditsText.setText(`Credits: ${this.credits}`);
    }

    private spinReels(): void {
        this.spinning = true;
        this.spinButton.setInteractive(false);

        this.credits -= this.betAmount;
        this.updateCreditsDisplay();

        console.log('Spinning the reels!');

        this.reels.forEach((row, rowIndex) => {
            row.forEach((reel, colIndex) => {
                const spinDuration = 500;
                const spinDistance = 600;
                const easing = 'Cubic.easeOut';

                this.tweens.add({
                    targets: reel,
                    y: reel.y + spinDistance,
                    duration: spinDuration,
                    ease: 'Linear',
                    onComplete: () => {
                        reel.y = this.startY + rowIndex * (this.reelHeight + this.ySpacing);
                        this.randomizeReel(reel);
                    }
                });

                this.time.delayedCall((rowIndex + colIndex) * 100, () => {
                    this.tweens.add({
                        targets: reel,
                        y: reel.y + spinDistance,
                        duration: spinDuration,
                        ease: easing,
                        onComplete: () => {
                            reel.y = this.startY + rowIndex * (this.reelHeight + this.ySpacing);
                            this.randomizeReel(reel);
                            if (rowIndex === 2 && colIndex === 2) { // All reels have stopped
                                this.checkWinningCombination();
                                this.spinning = false;
                                this.spinButton.setInteractive(true);
                            }
                        }
                    });
                });
            });
        });
    }

    private randomizeReel(reel: Phaser.GameObjects.Sprite): void {
        const isWin = Phaser.Math.RND.realInRange(0, 100) <= this.winningRatio;
        if (isWin) {
            const winningSymbol = Phaser.Math.RND.pick(this.winningCombinations[0]);
            reel.setTexture(winningSymbol);
        } else {
            const randomSymbol = Phaser.Math.RND.pick(this.symbols);
            reel.setTexture(randomSymbol);
        }
    }

    private checkWinningCombination(): void {
        const displayedSymbols: string[] = this.reels[0].map(reel => reel.texture.key);

        const isWinning = this.winningCombinations.some(combo => {
            return combo.every((symbol, index) => symbol === displayedSymbols[index]);
        });

        if (isWinning) {
            console.log('You win!');
            this.credits += this.betAmount * 2; // Example: double the bet amount
        } else {
            console.log('You lose!');
        }
        
        this.updateCreditsDisplay();
    }
}
