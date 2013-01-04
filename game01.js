enchant();

// 画面サイズ
var SCREEN_WIDTH	= 320;
var SCREEN_HEIGHT	= 320;
// 戦車の種別
var TANKTYPE_PLAYER	= 0;
var TANKTYPE_ENEMY	= 1;

var Tank = Class.create(Sprite, {
	initialize: function(type,direction){
		Sprite.call(this, 32, 32);
		this.image = game.assets['js/images/chara3.png'];
		this.pattern = 0;
		this.direction = direction;
		this.isMoving = false;
		if (type == TANKTYPE_PLAYER) {
			// 緑色の戦車を表すフレーム番号
			this.frame = 0;
			// キー入力の確認や戦車の移動プログラムを登録する。
			this.addEventListener('enterframe', function() {
				if (this.isMoving == false) {
					// 移動方向を表す情報をクリアする。
					this.vx = this.vy = 0;

					// キーの入力状態をチェックする。
					// 入力状態に合わせて戦車の向き情報を変更する。
					// 向き 0:下、1:左、2:右、3:上
					if (game.input.left) {
						this.direction = 1;
						this.vx = -1;
					} else if (game.input.right) {
						this.direction = 2;
						this.vx = 1;
					} else if (game.input.up) {
						this.direction = 3;
						this.vy = -1;
					} else if (game.input.down) {
						this.direction = 0;
						this.vy = 1;
					} else if (game.input.a) {
						// 弾を撃つ。つまり弾スプライトを発生する。
						// スプライトのサイズが違うため、戦車の座標をそのまま使うことができない。
						// そのため弾の座標を特別に計算する。
						var shot = new Shot(this.x+((32-16)/2), this.y+((32-16)/2), TANKTYPE_PLAYER, this.direction);
						game.currentScene.addChild(shot);
					} else if (game.input.b) {
					}
					if (this.vx || this.vy) {
						// 一ブロック分移動した後の座標を計算する。
						var x = this.x + this.vx * 32;
						var y = this.y + this.vy * 32;
						if (0 <= x && x < SCREEN_WIDTH && 0 <= y && y < SCREEN_HEIGHT) {
							// 一ブロック分移動した後の座標がステージの範囲内であれば移動処理を開始する。
							this.isMoving = true;
							// Timeline機能を使って移動処理を行う。
							this.tl
								.moveTo(x, y, 4, enchant.Easing.LINEAR)
								.and()
								.then(function() {
									// ４方向、３パターンのうちどのフレームを使うかを計算する。
									this.pattern = (this.pattern + 1) % 3;
									this.frame = this.direction * 6 + this.pattern;
								})
								.then(function() {
									this.isMoving = false;
								});
							
						}
					}
				}
			});
		} else {
			// デザートカラーの戦車を表すフレーム番号
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
		// 使用する弾画像のフレーム番号をセット。
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
			this.vy = 1;
		} else if (direction == 1) {
			this.frame = topFrame + 2;
			this.vx = -1;
		} else if (direction == 2) {
			this.frame = topFrame + 6;
			this.vx = 1;
		} else if (direction == 3) {
			this.frame = topFrame;
			this.vy = -1;
		}
		this.addEventListener('enterframe', function() {
			if (this.vx || this.vy) {
				// スクリーンの端かまたは何かに当たるまで飛んでいく。
				// 2012/12/09時点ではスクリーンの端についたかどうかのチェックのみ。
				if (0 <= this.x && this.x < SCREEN_WIDTH && 0 <= this.y && this.y < SCREEN_HEIGHT) {
					// 現在座標が画面内の場合は座標を更新する。
					this.moveBy(this.vx * 16, this.vy * 16);
				} else {
					// 現在座標がすでに画面外であればステージから削除する。
					// この時点でこの弾スプライトはゲーム内に存在しなくなる。
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
