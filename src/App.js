import { Lightning, Utils } from "@lightningjs/sdk";

export default class App extends Lightning.Component {
  static getFonts() {
    return [
      { family: "Regular", url: Utils.asset("fonts/Roboto-Regular.ttf") },
    ];
  }

  static _template() {
    return {
      RoundRectangle: {
        w: 1920,
        h: 1080,
        texture: Lightning.Tools.getRoundRect(
          1920,
          1080,
          0,
          20,
          0xffb967ff,
          true,
          0xff284b4b
        ),
      },

      Snake: {
        x: 300,
        y: 300,
        Body: {
          rect: true,
          w: 20,
          h: 20,
          color: 0xff00ff00,
        },
      },
      Food: {
        x: 0,
        y: 0,
        w: 30,
        h: 30,
        rect: true,
        color: 0xffff0000,
      },
      GameEnd: {
        w: 1920,
        h: 1080,
        rect: true,
        visible: false,
        color: 0xff000000,
        Message: {
          MyScore: {
            x: 1920 / 2,
            y: 1080 / 2 - 80,
            mount: 0.5,
            text: {
              text: "Your Score: ",
              fontFace: "Regular",
              fontSize: 64,
              textColor: 0xbbffffff,
            },
          },
          Text1: {
            x: 1920 / 2,
            y: 1080 / 2,
            mount: 0.5,
            text: {
              text: "Game Over!",
              fontFace: "Regular",
              fontSize: 64,
              textColor: 0xbbffffff,
            },
          },
          Text2: {
            x: 1920 / 2,
            y: 1080 / 2 + 80,
            mount: 0.5,
            text: {
              text: "Press Enter to Try again",
              fontFace: "Regular",
              fontSize: 40,

              textColor: 0xbb00ff00,
            },
          },
        },
      },
      Score: {
        x: 50,
        y: 50,
        text: {
          text: "Score: 0",
          fontFace: "Regular",
          fontSize: 32,
          textColor: 0xffffffff,
        },
      },
    };
  }

  _init() {
    this._createSnake();
    this._createFood();
    this._startGameLoop();
  }

  _createSnake() {
    this._snake = this.tag("Snake");
    this._score = 0;

    this._snakeX = 300;
    this._snakeY = 300;
    this._snakeSpeed = 5;
    this._snakeDirection = { x: 1, y: 0 };
    this._snakeTail = [];
  }

  _createFood() {
    this._food = this.tag("Food");
    this._foodX = Math.floor(Math.random() * 1800) + 30;
    this._foodY = Math.floor(Math.random() * 1000) + 30;
    this._food.patch({ x: this._foodX, y: this._foodY });
  }

  _startGameLoop() {
    this._gameLoop = this.animation({
      duration: 0.05,
      repeat: -1,
      actions: [
        {
          t: "Snake.Body",
          p: "x",
          v: { 0: this._snakeX },
        },
        {
          t: "Snake.Body",
          p: "y",
          v: { 0: this._snakeY },
        },
      ],
    });

    this._gameLoop.on("progress", (progress) => {
      this._snakeX += this._snakeDirection.x * this._snakeSpeed;
      this._snakeY += this._snakeDirection.y * this._snakeSpeed;

      this._checkCollision();
      this._updateSnake();
    });

    this._gameLoop.start();
  }

  _handleDown() {
    if (this._snakeDirection.y != -1) {
      this._snakeDirection = { x: 0, y: 1 };
    }
  }

  _handleLeft() {
    if (this._snakeDirection.x != 1) this._snakeDirection = { x: -1, y: 0 };
  }

  _handleRight() {
    if (this._snakeDirection.x != -1) this._snakeDirection = { x: 1, y: 0 };
  }

  _handleUp() {
    if (this._snakeDirection.y != 1) this._snakeDirection = { x: 0, y: -1 };
  }

  _checkCollision() {
    if (
      Math.abs(this._snakeX - this._foodX + 300) <= 20 &&
      Math.abs(this._snakeY - this._foodY + 300) <= 20
    ) {
      this._eatFood();
    }

    if (
      this._snakeX < -300 ||
      this._snakeX >= 1880 - 300 ||
      this._snakeY < -300 ||
      this._snakeY >= 1040 - 300
    ) {
      this._endGame();
    }
  }

  _checkSelfCollision() {
    for (let i = 1; i < this._snakeTail.length; i++) {
      const tailSegment = this._snakeTail[i];
      if (tailSegment.x === this._snakeX && tailSegment.y === this._snakeY) {
        return true;
      }
    }
    return false;
  }

  _eatFood() {
    this._snakeTail.push({ x: this._snakeX, y: this._snakeY });
    this._createFood();
    this._score += 1;
    this.tag("Score").text.text = `Score: ${this._score}`;
  }

  _updateSnake() {
    const tailSegment = { x: this._snakeX, y: this._snakeY };
    this._snakeTail.unshift(tailSegment);

    if (this._snakeTail.length > 3) {
      this._snakeTail.pop();
    }

    this._snake.patch({
      children: this._snakeTail.map((segment) => ({
        rect: true,
        w: 20,
        h: 20,
        x: segment.x,
        y: segment.y,
        color: 0xff00ff00,
      })),
    });
  }

  _handleEnter() {
    if (this.tag("GameEnd").visible) {
      this._gameLoop.stop();
      this._createSnake();
      this._createFood();
      this._startGameLoop();
      this.tag("GameEnd").visible = false;
      this._score = 0;
      this.tag("Score").text.text = "Score: 0";
      this.tag("GameEnd").visible = false;
    }
  }

  _endGame() {
    this._gameLoop.stopNow();
    this.tag("GameEnd").visible = true;
    this.tag("MyScore").text.text = `Score: ${this._score}`;
  }
}
