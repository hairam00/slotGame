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
    private winningRatio: number = 50;
    private credits: number = 1000;
    private betAmount: number = 0.40;
    private betAmountText!: Phaser.GameObjects.Text;

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
        this.createBetControls();  // Create bet controls (without images)
        this.updateCreditsDisplay();
    }

    private updateLayout(): void {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        // Adjust reel width and height based on the screen size
        this.reelWidth = gameWidth * 0.2; // Example: 20% of the screen width
        this.reelHeight = gameHeight * 0.3; // Example: 30% of the screen height
        
        this.xSpacing = this.reelWidth * 0.1;  // Spacing between reels is 10% of reel width
        this.ySpacing = this.reelHeight * 0.01; // Spacing between rows is 1% of reel height
    
        // Calculate starting X and Y coordinates for the reels
        this.startX = (gameWidth - (this.reelWidth + this.xSpacing) * 3) / 2;
        this.startY = (gameHeight - (this.reelHeight + this.ySpacing) * 3) / 2;
    }
    

    private createReelsBox(): void {
        const boxWidth = this.reelWidth * 3 + this.xSpacing * 2;
        const boxHeight = this.reelHeight * 3 + this.ySpacing * 2;
        const boxX = this.startX - 10; // Padding around the box
        const boxY = this.startY - 10;

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
                const x = this.startX + col * (this.reelWidth + this.xSpacing) + this.reelWidth / 2;
                const y = this.startY + row * (this.reelHeight + this.ySpacing) + this.reelHeight / 2;
                
                // Create the reel symbol
                const reel = this.add.sprite(x, y, 'symbol1').setOrigin(0.5, 0.5);
                
                // Make the reel symbol responsive
                reel.setDisplaySize(this.reelWidth, this.reelHeight);
                
                // Store the reel in the array
                this.reels[row].push(reel);
            }
        }
    }
    
    
    private addSpinButton(): void {
        // Set dynamic size for the spin button based on screen size
        const buttonWidth = this.cameras.main.width * 0.1;  // 10% of the screen width
        const buttonHeight = this.cameras.main.height * 0.1; // 10% of the screen height
    
        // Place the button at the bottom center of the screen
        const buttonX = this.cameras.main.centerX;
        const buttonY = this.cameras.main.height - buttonHeight / 2 - 20; // Padding from bottom
    
        // Create the button and make it interactive
        this.spinButton = this.add.sprite(buttonX, buttonY, 'spinButton').setInteractive();
        
        // Scale the spin button to be responsive
        this.spinButton.setDisplaySize(buttonWidth, buttonHeight);
    
        // Add the click event listener
        this.spinButton.on('pointerdown', () => {
            if (!this.spinning && this.credits >= this.betAmount) {
                console.log('Spin button clicked!');
                this.spinReels();
            }
        });
    }
    
    private createCreditsBox(): void {
        // Calculate box dimensions
        const boxWidth = this.cameras.main.width * 0.15;
        const boxHeight = this.cameras.main.height * 0.05;
        const boxX = 10;
        const boxY = this.cameras.main.height - boxHeight - 20;
    
        // Create the credit box
        this.creditsBox = this.add.graphics();
        this.creditsBox.fillStyle(0x000000, 0.8);
        this.creditsBox.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.creditsBox.lineStyle(4, 0xffd700, 1);
        this.creditsBox.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
        // Adjust the text size based on box height (allow padding inside the box)
        let fontSize = Math.min(boxHeight * 0.5, this.cameras.main.width * 0.02);  // Font size relative to the box
    
        // Add credits text with dynamic font size and padding
        this.creditsText = this.add.text(boxX + boxWidth / 2, boxY + boxHeight / 2, `Credits: ${this.credits}`, {
            fontSize: `${fontSize}px`,
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
    
        // Ensure the text fits inside the box by adjusting the font size
        while (this.creditsText.width > boxWidth * 0.9 && fontSize > 10) {  // 90% of box width
            fontSize -= 1;
            this.creditsText.setFontSize(fontSize);
        }
    }
    

    private updateCreditsDisplay(): void {
        this.credits = parseFloat(this.credits.toFixed(2)); // Round to 2 decimal places
        this.creditsText.setText(`Credits: $${this.credits.toFixed(2)}`);
    }

    private createBetControls(): void {
        // Calculate box dimensions
        const boxWidth = this.cameras.main.width * 0.15;
        const boxHeight = this.cameras.main.height * 0.05;
        const betControlX = this.cameras.main.width - boxWidth - 20;
        const betControlY = this.cameras.main.height - boxHeight - 20;
    
        // Create the bet control box
        const betBox = this.add.graphics();
        betBox.fillStyle(0x000000, 0.8);
        betBox.fillRect(betControlX, betControlY, boxWidth, boxHeight);
        betBox.lineStyle(4, 0xffd700, 1);
        betBox.strokeRect(betControlX, betControlY, boxWidth, boxHeight);
    
        // Adjust the size of "-" and "+" buttons relative to the box
        let buttonFontSize = Math.min(boxHeight * 0.6, this.cameras.main.width * 0.04);  // Button font size relative to box
    
        // "-" button
        const minusButton = this.add.text(betControlX + 20, betControlY + boxHeight / 2, '-', {
            fontSize: `${buttonFontSize}px`,
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setInteractive();
    
        minusButton.on('pointerdown', () => {
            this.adjustBetAmount(-0.10);
        });
    
        // "+" button
        const plusButton = this.add.text(betControlX + boxWidth - 20, betControlY + boxHeight / 2, '+', {
            fontSize: `${buttonFontSize}px`,
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setInteractive();
    
        plusButton.on('pointerdown', () => {
            this.adjustBetAmount(0.10);
        });
    
        // Adjust the text size based on box height (allow padding inside the box)
        let betFontSize = Math.min(boxHeight * 0.5, this.cameras.main.width * 0.02);  // Font size relative to the box
    
        // Add bet amount text and adjust the font size dynamically
        this.betAmountText = this.add.text(betControlX + boxWidth / 2, betControlY + boxHeight / 2, `Bet: $${this.betAmount.toFixed(2)}`, {
            fontSize: `${betFontSize}px`,
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
    
        // Ensure the text fits inside the box
        while (this.betAmountText.width > boxWidth * 0.9 && betFontSize > 10) {  // 90% of box width
            betFontSize -= 1;
            this.betAmountText.setFontSize(betFontSize);
        }
    }

    private adjustBetAmount(amount: number): void {
        const newBet = this.betAmount + amount;
        if (newBet >= 0.10 && newBet <= this.credits) {  // Ensure bet amount is valid
            this.betAmount = parseFloat(newBet.toFixed(2)); // Round to 2 decimal places
            this.updateBetAmountDisplay();
        }
    }

    private updateBetAmountDisplay(): void {
        this.betAmountText.setText(`Bet: $${this.betAmount.toFixed(2)}`);
    }

    private spinReels(): void {
        this.spinning = true;  // Mark that the reels are spinning
        this.spinButton.disableInteractive();  // Disable the spin button
    
        // Deduct the bet amount from credits
        this.credits -= this.betAmount;
        this.updateCreditsDisplay();
    
        let reelsStopped = 0;  // Counter for stopped reels
    
        this.reels.forEach((row, rowIndex) => {
            row.forEach((reel, colIndex) => {
                const spinDuration = 500;  // Duration of the spin animation
                const spinDistance = 600;  // How far each reel will "spin"
                const easing = 'Cubic.easeOut';  // Easing for the animation
    
                // First tween animation to simulate spinning downwards
                this.tweens.add({
                    targets: reel,
                    y: reel.y + spinDistance,
                    duration: spinDuration,
                    ease: 'Linear',
                    onComplete: () => {
                        // Reset the reel's position to simulate continuous spinning
                        reel.y = this.startY + rowIndex * (this.reelHeight + this.ySpacing) + this.reelHeight / 2;
                        this.randomizeReel(reel);  // Assign a random symbol to the reel
    
                        reelsStopped++;
    
                        // If all reels have stopped, check the result
                        if (reelsStopped === this.reels.length * this.reels[0].length) {
                            this.checkWinningCombination();  // Check if the player won
                            this.spinning = false;  // Reset spinning flag
                            this.spinButton.setInteractive();  // Re-enable the spin button
                        }
                    }
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
            this.credits = parseFloat(this.credits.toFixed(2)); // Round to 2 decimal places after win
        } else {
            console.log('You lose!');
        }
        
        this.updateCreditsDisplay();
    }
}
