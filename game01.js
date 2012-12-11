enchant();

var SCREEN_WIDTH	= 320;
var SCREEN_HEIGHT	= 320;
var TANKTYPE_PLAYER	= 0;
var TANKTYPE_ENEMY	= 1;

var Tank = Class.create(Sprite, {
	initialize: function(type,direction){
		Sprite.call(this, 32, 32);
		this.image = game.assets['js/images/chara3.png'];
		if (type == TANKTYPE_PLAYER) {
			// 緑色の戦車
			this.frame = 0;
			// キー入力の確認や戦車の移動プログラムを登録する。
			this.addEventListener('enterframe', function() {
				this.animCheck++;
				// ４方向、３パターンのうちどのフレームを使うかを計算する。
				this.frame = this.direction * 6;
				if (this.isMoving) {
					this.moveBy(this.vx, this.vy);
					if ((this.animCheck % 2) == 1) {
						this.pattern++;
						this.pattern %= 4;
					}
					if ((this.vx && this.x % 32 == 0) || (this.vy && this.y % 32 == 0)) {
						this.isMoving = false;
						this.pattern = 1;
					}
				} else {
					this.vx = this.vy = 0;

					// 向き 0:下、1:左、2:右、3:上
					if (game.input.left) {
						this.direction = 1;
						this.vx = -16;
					} else if (game.input.right) {
						this.direction = 2;
						this.vx = 16;
					} else if (game.input.up) {
						this.direction = 3;
						this.vy = -16;
					} else if (game.input.down) {
						this.direction = 0;
						this.vy = 16;
					} else if (game.input.a) {
						var shot = new Shot(this.x+((32-16)/2), this.y+((32-16)/2), TANKTYPE_PLAYER, this.direction);
						game.currentScene.addChild(shot);
					} else if (game.input.b) {
					}
					if (this.vx) {
						var x = this.x + this.vx;
						var y = this.y + this.vy;
						if (0 <= x && x < SCREEN_WIDTH-32) {
							this.isMoving = true;
							this.animCheck = 0;	// アニメーションカウンタは必要に応じてリセット。
							arguments.callee.call(this);
						}
					}
					if (this.vy) {
						var x = this.x + this.vx;
						var y = this.y + this.vy;
						if (0 <=y && y < SCREEN_HEIGHT-32) {
							this.isMoving = true;
							this.animCheck = 0;	// アニメーションカウンタは必要に応じてリセット。
							arguments.callee.call(this);
						}
					}
				}
			});
		} else {
			// デザートカラーの戦車
			this.frame = 3;
		}
	}
});

var Shot = Class.create(Sprite, {
	initialize: function(x,y,type,direction){
		Sprite.call(this, 16, 16);
		this.image = game.assets['js/images/icon0.png'];
		this.x = x;
		this.y = y;
		// 使用する画像パターンの先頭のフレーム番号をセット。
		var topFrame = 0;
		if (type == TANKTYPE_PLAYER) {
			topFrame = 48;
		} else {
			topFrame = 56;
		}
		// 向きは戦車と同じ情報を受け取る。しかし画像の格納順は一致していない。
		// 0:下、1:左、2:右、3:下
		this.vx = this.vy = 0;
		if (direction == 0) {
			this.frame = topFrame + 4;
			this.vy = 8;
		} else if (direction == 1) {
			this.frame = topFrame + 2;
			this.vx = -8;
		} else if (direction == 2) {
			this.frame = topFrame + 6;
			this.vx = 8;
		} else if (direction == 3) {
			this.frame = topFrame;
			this.vy = -8;
		}
		this.addEventListener('enterframe', function() {
			// スクリーンの端かまたは何かに当たるまで飛んでいく。
			// 2012/12/09時点ではスクリーンの端についたかどうかのチェックのみ。
			var x = this.x + this.vx;
			var y = this.y + this.vy;
			if (this.vx != 0) {
				if (0 <= x && x < SCREEN_WIDTH-8) {
					this.moveBy(this.vx, this.vy);
				} else {
					game.currentScene.removeChild(this);
				}
			}
			if (this.vy != 0) {
				if (0 <=y && y < SCREEN_HEIGHT-8) {
					this.moveBy(this.vx, this.vy);
				} else {
					game.currentScene.removeChild(this);
				}
			}
		});
	}
});

window.onload = function() {
	
	game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
	
	game.fps = 24;
	game.touched = false;
	game.preload('js/images/chara3.png', 'js/images/icon0.png');
	game.keybind(90, 'a');      // ＺキーをＡボタンとみなす
	game.keybind(88, 'b');      // ＸキーをＢボタンと見なす
	
	game.onload = function() {
		game.currentScene.backgroundColor = 'rgb(239, 228, 202)';

		// 緑色の戦車（自分用）のスプライトを用意。
		var myTank = new Tank(TANKTYPE_PLAYER, 0);
		// 表示位置の指定
		myTank.x = 128;
		myTank.y = 160;
		myTank.isMoving = false;
		// 向き 0:下、1:左、2:右、3:上
		myTank.direction = 0;
		myTank.animCheck = 0;	// アニメーションパターンの切替えタイミングをコントロールするために使用する。
		myTank.pattern = 0;
		
		// デザートカラーの戦車（敵用）のスプライトを用意。
		var teki = new Tank(TANKTYPE_ENEMY, 0);
		// 表示位置の指定
		teki.x = 192;
		teki.y = 160;

		// 用意したスプライトをシーンに関連づける。シーンはスクラッチで言えばステージのこと。
		// これで表示されるようになる。
		game.currentScene.addChild(teki);
		game.currentScene.addChild(myTank);
	};
	game.start();
};
