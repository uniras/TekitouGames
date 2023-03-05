/** キーコードを保存する連想配列型 */
type GameKeys = {
  [index: string]: boolean;
}

/** キーコードを保存する連想配列型 */
type GameKeyCodes = {
  [index: string]: boolean;
}

/** グローバル関数を保存する連想型配列 */
type GameGlobalFunction = {
  [index: string]: Function | undefined;
}

/** マウス位置を表す型 */
type MousePos = {
  x: number,
  y: number
}

/** GameBase.addObjectメソッドに渡すコールバック関数の型 */
interface AddObjectCallback {
  (obj: GameObject, base: GameBase, args: Object): void
}

/** 関数ベースのGameObject型 */
type GameFunction = AddObjectCallback;

/** グローバル関数型 */
type GlobalFunction = () => void;

/** GameBaseクラスのコンストラクタに渡すコールバック関数の型 */
interface OnStartCallback {
  (base: GameBase): void
}

/** GameObject用の画像管理クラス */
export class ImageObject {
  /** イメージのURL */
  url: string;
  /** imageオブジェクト */
  img: HTMLImageElement | null;
  /** ロード済みかどうか */
  loaded: boolean;
  /** 画像をGameObjectのサイズに拡大縮小するかどうか */
  stretch: boolean;
  /** Imageオブジェクトの一部だけを表示するかどうか */
  clip: boolean;
  /** 使用するImageオブジェクトのx位置 */
  clipx: number;
  /** 使用するImageオブジェクトのy位置 */
  clipy: number;
  /** 使用するImageオブジェクトの幅 */
  clipw: number;
  /** 使用するImageオブジェクトの高さ */
  cliph: number;

  /** コンストラクタ */
  constructor() {
    this.url = '';
    this.img = null;
    this.loaded = false;
    this.stretch = false;
    this.clip = false;
    this.clipx = 0;
    this.clipy = 0;
    this.clipw = 0;
    this.cliph = 0;
  }

  /** 
   * 作成済みのImageオブジェクトを登録します
   * @param obj Imageオブジェクト
   */
  loadObject(obj: HTMLImageElement): void {
    this.img = obj;
    this.url = obj.src;
    this.loaded = this.img.complete && this.img.naturalHeight !== 0;;
  }

  /**
   * URLからImageオブジェクトを作成して登録します
   * @param url URL
   */
  loadUrl(url: string): void {
    this.url = url;
    this.img = new Image();
    this.img.src = url;
    this.img.onload = () => {
      if (this.img) this.loaded = this.img.complete && this.img.naturalHeight !== 0;;
    }
  }

  /**
   * Base64形式の画像データからImageオブジェクトを作成して登録します
   * @param img Base64形式の画像データ
   * @param type 画像データのファイルタイプ、デフォルトはPNG形式
   */
  loadBase64(img: string, type: string = 'image/png'): void {
    const datauri = 'data:' + type + ';base64,' + img;
    this.loadUrl(datauri);
  }

  /**
   * 登録したImageオブジェクトがロード済みか確認します
   * @returns ロード済みかどうか
   */
  isLoaded(): boolean {
    if (!this.img) return false;
    return this.img.complete && this.img.naturalHeight !== 0;
  }

  /**
   * Imageオブジェクトの一部だけを表示するかどうか設定します
   * @param clip Imageオブジェクトの一部だけを表示するかどうか
   * @param x 使用するImageオブジェクトのx位置
   * @param y 使用するImageオブジェクトのy位置
   * @param w 使用するImageオブジェクトの幅
   * @param h 使用するImageオブジェクトの高さ
   */
  setClip(clip: boolean, x: number = 0, y: number = 0, w: number = 0, h: number = 0): void {
    this.clip = clip;
    this.clipx = x;
    this.clipy = y;
    this.clipw = w;
    this.cliph = h;
  }

  /**
   * ImageオブジェクトをGameObjectのサイズに合わせて拡大縮小するかどうか設定します
   * @param stret 拡大縮小するかどうか
   */
  setStretch(stret: boolean): void {
    this.stretch = stret;
  }
}

/** Canvasベースのゲーム基本クラス */
export class GameBase {
  /** HTML5のCanvas */
  canvas: HTMLCanvasElement | null;
  /** Canvasコンテキスト */
  ctx: CanvasRenderingContext2D | null;
  /** ゲームの状態を管理する数値です */
  state: number;
  /** 管理しているGameObjectの配列 */
  gameobj: Array<GameObject>;
  /** 現在押されているキーを管理する連想配列 */
  pkey: GameKeys;
  /** 現在押されているキーを管理する連想配列 */
  pkeycode: GameKeyCodes;
  /** 現在のカーソル位置 */
  mousepos: MousePos;
  /** 最近クリックした位置 */
  clickpos: MousePos;
  /** 開始からのフレーム数(20億フレームで1周します) */
  frame: number;
  /** GameObject用グローバルオブジェクト */
  global: GameGlobalFunction;
  /** GameBaseが正しくロード済みかどうかを判定するフラグ */
  loaded: boolean;

  /** 
   * コンストラクタ
   * @param canvas - CanvasオブジェクトまたはCanvas要素を指すid文字列
   * @param func - Canvasオブジェクト作成後に呼び出されるコールバック関数、nullだと無効です。設定すると継承してもonStartメソッドは呼び出されません
   */
  constructor(canvas: HTMLCanvasElement | string | null, func: OnStartCallback | null = null) {
    this.canvas = null;
    this.ctx = null;
    this.state = 0;
    this.gameobj = [];
    this.pkey = {};
    this.pkeycode = {};
    this.mousepos = { x: 0, y: 0 };
    this.clickpos = { x: 0, y: 0 };
    this.frame = 0;
    this.global = {};

    this.loaded = false;
    if (typeof canvas === 'string') {
      const canvasstr = canvas;
      canvas = document.getElementById(canvasstr) as HTMLCanvasElement | null;
      if (!canvas) {
        window.addEventListener('DOMContentLoaded', () => {
          canvas = document.getElementById(canvasstr) as HTMLCanvasElement | null;
          if (canvas) {
            if (func) this.onStart = func;
            this._canvasInit(canvas);
          }
        });
        return;
      }
    }

    if (canvas) {
      if (func) this.onStart = func;
      this._canvasInit(canvas as HTMLCanvasElement);
    }
  }

  /** 内部の初期化メソッドです */
  _canvasInit(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.canvas = canvas;
    this.ctx = ctx;
    this._init();
  }

  /** 内部の初期化メソッドです */
  _init(): void {
    document.addEventListener('keydown', e => {
      if (!e.repeat) {
        this.pkey[e.key.toLowerCase()] = true;
        this.pkeycode[e.code.toLowerCase()] = true;
      }
    });

    document.addEventListener('keyup', e => {
      if (!e.repeat) {
        this.pkey[e.key.toLowerCase()] = false;
        this.pkeycode[e.code.toLowerCase()] = false;
      }
    });

    document.addEventListener('mousemove', e => {
      if (this.canvas) {
        this.mousepos.x = e.clientX - this.canvas.offsetLeft;
        this.mousepos.y = e.clientY - this.canvas.offsetTop;
      } else {
        this.mousepos.x = e.clientX;
        this.mousepos.y = e.clientY;
      }
    });

    document.addEventListener('mousedown', e => {
      this.pkey['mouse'] = true;
      this.pkeycode['mouse'] = true;
      if (this.canvas) {
        this.clickpos.x = e.clientX - this.canvas.offsetLeft;
        this.clickpos.y = e.clientY - this.canvas.offsetTop;
      } else {
        this.clickpos.x = e.clientX;
        this.clickpos.y = e.clientY;
      }
    });

    document.addEventListener('mouseup', e => {
      this.pkey['mouse'] = false;
      this.pkeycode['mouse'] = false;
    });

    this.loaded = true;
    this.onStart(this);
    this._draw();
  }

  /** 内部のゲームループです */
  _draw(): void {
    if (!this.loaded) return;
    this.frame = (this.frame + 1) % 2000000000;
    if (this.canvas && this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.onDraw(this.state, this.canvas, this.ctx);
    requestAnimationFrame(this._draw.bind(this));
  }

  /**
   * GameBaseインスタンスが正しくロードされているかどうかを確認する
   * @returns ロード済みかどうかを表すboolean値
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * GameBaseに対応したCanvasの幅を取得する
   */
  get width(): number {
    if (!this.canvas) return -1;
    return this.canvas.width;
  }

  /**
   * GameBaseに対応したCanvasの高さを取得する
   */
  get height(): number {
    if (!this.canvas) return -1;
    return this.canvas.height;
  }

  /**
   * GameBaseにGameObjectを追加登録します
   * 追加することで毎フレームGameObjectのdrawメソッドを呼び出します。
   * @param obj GameObjectインスタンスまたはGameObject追加後に呼び出すコールバック関数(関数ベースのGameObject)
   * @param args GameObjectに設定かつコールバック関数に渡すオブジェクト変数
   */
  addObject(obj: GameObject | AddObjectCallback, args: Object = {}): void {
    if (!this.loaded) return;
    if (typeof obj === 'function') {
      let gobj: GameObject = new GameObject(this);
      this.gameobj.push(gobj);
      gobj = Object.assign(gobj, args);
      obj(gobj, this, args);
      gobj.init(this);
    } else {
      obj = Object.assign(obj, args);
      this.gameobj.push(obj);
      obj.base = this;
      obj.init(this);
    }
  }

  /**
   * GameBaseからGameObjectの登録を削除します
   * @param obj GameBaseから削除するGameObjectインスタンス
   */
  removeObject(obj: GameObject): void {
    if (!this.loaded) return;
    if (this.gameobj.indexOf(obj) > -1) {
      this.gameobj[this.gameobj.indexOf(obj)].remove();
      this.gameobj.splice(this.gameobj.indexOf(obj), 1);
    }
  }

  /**
   * GameBaseに登録されているGameObjectをすべて登録解除します
   */
  clearObject(): void {
    if (!this.loaded) return;
    this.gameobj.forEach(obj => obj.remove());
    this.gameobj = [];
  }

  /**
   * ゲームの状態を変更します
   * @param state ゲームの状態を示す数値
   */
  setState(state: number): void {
    if (!this.loaded) return;
    this.state = state;
  }

  /**
   * ゲームの状態を取得します
   * @returns ゲームの状態を示す数値
   */
  getState(): number {
    if (!this.loaded) return 0;
    return this.state;
  }

  /**
   * 開始からのフレーム数を取得します
   * 20億でループします
   * @returns フレーム数
   */
  getFrame(): number {
    if (!this.loaded) return 0;
    return this.frame;
  }

  /**
   * 引数で指定したキーが押されているか確認します
   * @param key 押されているか確認するキー名
   * @param repeat falseにすると押されていなかったことにしてキーリピートを無効にします
   * @returns 押されているかどうかを示すboolean値
   */
  getKey(key: string, repeat: boolean = false): boolean {
    if (!this.loaded) return false;
    let result = this.pkey[key.toLowerCase()];
    if (!repeat) this.pkey[key.toLowerCase()] = false;
    return result;
  }

  /**
   * 引数て指定したキーを押していないことにします
   * @param key 押されていないことにするキー名
   */
  clearKey(key: string): void {
    if (!this.loaded) return;
    this.pkey[key.toLowerCase()] = false;
  }

  /**
   * 全てのキーを押していないことにします
   */
  clearKeyAll(): void {
    if (!this.loaded) return;
    this.pkey = {};
  }

  /**
   * 引数で指定したキーコードが押されているか確認します
   * @param code 押されているか確認するキーコード名
   * @param repeat falseにすると押されていなかったことにしてキーリピートを無効にします
   * @returns 押されているかどうかを示すboolean値
   */
  getKeyCode(code: string, repeat: boolean = false): boolean {
    if (!this.loaded) return false;
    let result = this.pkeycode[code.toLowerCase()];
    if (!repeat) this.pkeycode[code.toLowerCase()] = false;
    return result
  }

  /**
   * 引数て指定したキーコードを押していないことにします
   * @param key 押されていないことにするキーコード名
   */
  clearKeyCode(code: string): void {
    if (!this.loaded) return;
    this.pkeycode[code.toLowerCase()] = false;
  }

  /**
   * 全てのキーを押していないことにします
   */
  clearKeyCodeAll(): void {
    if (!this.loaded) return;
    this.pkeycode = {};
  }

  /**
   * 現在のカーソル位置を取得します
   * @returns 現在のカーソル位置
   */
  getMousePos(): MousePos {
    if (!this.loaded) return { x: 0, y: 0 };
    return this.mousepos;
  }

  /**
   * 直近でクリックした位置を取得します
   * @returns 直近でクリックした位置
   */
  getClickPos(): MousePos {
    if (!this.loaded) return { x: 0, y: 0 };
    return this.clickpos;
  }

  /**
   * ゲーム開始時に呼び出されるイベントメソッドです
   * @param base GameBaseインスタンス(関数ベース用)
   */
  onStart(base: GameBase) {
  }

  /**
   * 毎フレーム呼び出される描画イベントメソッドです。
   * デフォルトでは登録した各GameObjectのdrawメソッドを呼び出します。
   * 通常は継承して動作を変更する必要はありません。
   * @param state ゲーム状態を表す数値
   * @param canvas canvasオブジェクト
   * @param ctx レンダリングコンテキスト
   */
  onDraw(state: number, canvas: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D | null): void {
    if (!Array.isArray(this.gameobj) || this.gameobj.length === 0) return;
    this.gameobj.forEach(obj => obj.draw(state, canvas, ctx));
  }

  /**
   * Base64形式のサウンドデータからAudioオブジェクトを作成します
   * @param music Base64形式のサウンドデータ
   * @param type サウンドデータのファイルタイプ、指定しない場合はMP3形式
   * @returns Audioオブジェクト
   */
  createBase64Sound(music: string, type: string = 'audio/mp3'): HTMLAudioElement {
    const datauri = 'data:' + type + ';base64,' + music;
    const sound = new Audio(datauri);
    return sound;
  }

  /**
   * URLからAudioオブジェクトを作成します
   * @param url URL
   * @returns Audioオブジェクト
   */
  createUrlSound(url: string): HTMLAudioElement {
    const sound = new Audio(url);
    return sound;
  }

  /**
   * Audioオブジェクトを再生します
   * @param obj Audioオブジェクト
   * @param loop ループ再生をするか、デフォルトはfalse
   */
  playObjectSound(obj: HTMLAudioElement, loop: boolean = false): void {
    obj.loop = loop;
    obj.play();
  }

  /**
   * Audioオブジェクトの再生を一時停止します
   */
  pauseObjectSound(obj: HTMLAudioElement): void {
    obj.pause();
  }

  /**
   * Audioオブジェクトの再生を停止します
   */
  stopObjectSound(obj: HTMLAudioElement): void {
    obj.pause();
    obj.currentTime = 0;
  }

  /**
   * Base64形式のサウンドデータからAudioオブジェクトを作成して再生します
   * @param music Base64形式のサウンドデータ
   * @param type サウンドデータのファイルタイプ、デフォルトはMP3形式
   * @param loop ループ再生をするか、デフォルトはfalse
   * @returns Audioオブジェクト
   */
  playBase64Sound(music: string, type: string = 'audio/mp3', loop: boolean = false): HTMLAudioElement {
    const sound = this.createBase64Sound(music, type);
    sound.loop = loop;
    sound.play();
    return sound;
  }

  /**
   * URLからAudioオブジェクトを作成して再生します
   * @param url URL
   * @param loop ループ再生をするか、デフォルトはfalse
   * @returns Audioオブジェクト
   */
  playURLSound(url: string, loop: boolean = false): HTMLAudioElement {
    const sound = this.createUrlSound(url);
    sound.loop = loop;
    sound.play();
    return sound;
  }

  /**
   * GameObject用のグローバル変数を登録します
   * @param key グローバル変数名
   * @param data 値
   * @param rewrite 登録済みの場合上書きするか、デフォルトはtrue
   */
  setGlobal(key: string, data: any, rewrite: boolean = true): void {
    if (rewrite || typeof this.global[key] === 'undefined') {
      this.global[key] = data;
    }
  }

  /**
   * GameObject用のグローバル変数を登録します
   * @param key グローバル変数名
   * @returns 値
   */
  getGlobal(key: string): any {
    return this.global[key];
  }

  /**
   * GameObject用のグローバル関数を登録します、登録済みの場合は上書きしませんしcallがtrueでも呼び出ししません
   * @param fname グローバル関数名
   * @param func 関数
   * @param call 登録後に関数を呼び出すかどうか、デフォルトはtrue
   */
  setGlobalFunc(fname: string, func: GlobalFunction, call: boolean = true): void {
    if (typeof this.global[fname] === 'undefined' && typeof func === 'function') {
      this.global[fname] = func;
      if (call) this.global[fname]?.();
    }
  }

  /**
   * GameObject用のグローバル関数を呼び出します、未登録の場合は何もしません
   * @param fname グローバル関数名
   */
  callGlobalFunc(fname: string): void {
    if (typeof this.global[fname] === 'function') {
      this.global[fname]?.();
    }
  }

  /**
   * GameObject用のグローバル関数を削除します
   * @param fname グローバル関数名
   */
  removeGlobalFunc(fname: string): void {
    this.global[fname] = undefined;
  }

  /** グローバル変数用オブジェクト */
  static global: { [key: string]: any } = {};

  /**
   * グローバル変数の初期化
   * すでに該当の名前のオブジェクトが定義済みの場合は何もしない
   * @param key  変数名
   * @param obj   変数に登録するオブジェクト
   */
  static initGlobal(key: string, obj: any): void {
    if (!GameBase.global.hasOwnProperty(key)) {
      GameBase.global[key] = obj;
    }
  }

  /**
   * グローバル変数の書き込み
   * すでに該当の名前のオブジェクトが定義済みの場合でも上書きする
   * @param key  変数名
   * @param obj   変数に登録するオブジェクト
   */
  static setGlobal(key: string, obj: any): void {
    GameBase.global[key] = obj;
  }

  /**
   * グローバル変数の取得
   * @param key  変数名
   * @returns グローバル変数に登録されているデータ、登録されていない場合はundefined
   */
  static getGlobal(key: string): any {
    if (!GameBase.global.hasOwnProperty(key)) return undefined;
    return GameBase.global[key]
  }
}

/** ゲームオブジェクトクラス */
export class GameObject {
  /** x位置 */
  x: number
  /** y位置 */
  y: number
  /** 幅 */
  w: number
  /** 高さ */
  h: number
  /** 状態 */
  state: number
  /** 参照するGameBaseインスタンス */
  base: GameBase
  /** 画像の配列 */
  images: Array<ImageObject>
  /** 表示する画像番号 */
  imgnum: number

  /**
   * コンストラクタ
   * @param base 元となるGameBaseインスタンス
   */
  constructor(base: GameBase) {
    this.base = base;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.state = 0;
    this.images = [];
    this.imgnum = 0;
  }

  /**
   * オブジェクトの位置と大きさを設定する
   * @param xpos x位置
   * @param ypos y位置
   * @param width 幅
   * @param height 高さ
   */
  setRect(xpos: number, ypos: number, width: number, height: number): void {
    this.x = xpos;
    this.y = ypos;
    this.w = width;
    this.h = height;
  }

  /**
   * オブジェクトの位置を設定 
   * @param xpos x位置
   * @param ypos y位置
   */
  setPos(xpos: number, ypos: number): void {
    this.x = xpos;
    this.y = ypos;
  }

  /**
   * オブジェクトの状態番号を設定
   * @param gameState 状態を表す番号
   * @param setImgNum 表示する画像番号も同じ値に変更(デフォルトはtrue)
   */
  setState(gameState: number, setImgNum: boolean = true): void {
    this.state = gameState;
    if (setImgNum) this.imgnum = gameState;
  }

  /**
   * ゲームオブジェクトインスタンスのメンバの値をJavaScriptオブジェクトでまとめて変更します
   * @param data 変更する値が入ったJavaScriptオブジェクト
   */
  setData(data: object): void {
    Object.assign(this, data);
  }

  /**
   * GameBaseに登録した際に呼ばれるイベントメソッド
   * @param base GameBaseインスタンス
   */
  init(base: GameBase): void {
  }

  /**
   * 描画の際に呼ばれるイベントメソッド
   * 継承・上書きしない場合はオブジェクトに設定登録した画像番号の画像を描画
   * @param state GameBaseインスタンスの状態番号
   * @param canvas canvas要素
   * @param ctx canvasコンテキスト
   */
  draw(state: number, canvas: HTMLCanvasElement | null, ctx: CanvasRenderingContext2D | null): void {
    this.drawImage();
  }

  /**
   * ゲームベースからゲームオブジェクトが削除される時に呼ばれるメソッド
   */
  remove(): void {

  }

  /**
   * オブジェクトの位置と大きさで矩形を描画する
   * @param color 色を表す文字列
   * @param fill 塗りつぶすかどうか(デフォルトはfalse)
   */
  drawRect(color: string, fill: boolean = false): void {
    if (!this.base.ctx || !this.base.loaded) return;
    const ctx = this.base.ctx;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    ctx.closePath();
  }

  /**
   * オブジェクトの位置と大きさに内接する楕円を描画する
   * @param color 色を表す文字列
   * @param fill 塗りつぶすかどうか(デフォルトはfalse)
   */
  drawEllipse(color: string, fill: boolean = false): void {
    if (!this.base.ctx || !this.base.loaded) return;
    const ctx = this.base.ctx;
    ctx.beginPath();
    ctx.ellipse(this.x + (this.w / 2), this.y + (this.h / 2), this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    ctx.closePath();
  }

  /**
   * ゲームオブジェクトに画像オブジェクトを追加する
   * @param obj 画像オブジェクト
   */
  addImage(obj: ImageObject): void {
    this.images.push(obj);
  }

  /**
   * URLから画像オブジェクトを作成してゲームオブジェクトに追加する
   * @param url URL
   * @returns 画像オブジェクト
   */
  addImageUrl(url: string): ImageObject {
    let obj = new ImageObject();
    obj.loadUrl(url);
    this.addImage(obj);
    return obj;
  }

  /**
   * Base64形式の画像データから画像オブジェクトを作成してゲームオブジェクトに追加する
   * @param img Base64形式の画像データ
   * @param type 画像データのファイルタイプ、デフォルトはPNG形式
   * @returns 
   */
  addImageBase64(img: string, type: string = 'image/png'): ImageObject {
    let obj = new ImageObject();
    obj.loadBase64(img, type);
    this.addImage(obj);
    return obj;
  }

  /**
   * ゲームオブジェクトから画像を削除する
   */
  removeImage(): void {
    this.images.pop();
  }

  /**
   * ゲームオブジェクトに登録されている番号の画像を削除する
   * @param idx 削除する画像オブジェクトがある番号
   */
  removeImageIndex(idx: number): void {
    this.images.splice(idx, 1);
  }

  /**
   * ゲームオブジェクトから画像オブジェクトを全て削除する
   */
  clearImage(): void {
    this.images = [];
  }

  /**
   * 描画する画像オブジェクトの番号を変更する
   * @param num 描画する画像オブジェクトの番号
   */
  setImageNumber(num: number): void {
    if (num < 0) return;
    this.imgnum = num;
  }

  /**
   * 画像を描画します
   */
  drawImage() {
    if (!this.base.ctx || !this.base.loaded) return;
    const ctx = this.base.ctx;
    if (this.images.length > this.imgnum && this.images[this.imgnum].loaded) {
      let imgobj = this.images[this.imgnum];
      if (imgobj.img) {
        let sx = 0, sy = 0, sw = imgobj.img.width, sh = imgobj.img.height;
        let dw = imgobj.img.width, dh = imgobj.img.height;
        let dx = this.x, dy = this.y
        if (imgobj.clip) {
          sx = imgobj.clipx;
          sy = imgobj.clipy;
          sw = imgobj.clipw;
          sh = imgobj.cliph;
        }
        if (imgobj.stretch) {
          dw = this.w;
          dh = this.h;
        }
        ctx.drawImage(imgobj.img, sx, sy, sw, sh, dx, dy, dw, dh);
      }
    }
  }

  /**
   * ゲームオブジェクトの上位置を取得します
   */
  get top(): number {
    return this.y;
  }

  /**
   * ゲームオブジェクトの下位置を取得します
   */
  get bottom(): number {
    return this.y + this.h;
  }

  /**
   * ゲームオブジェクトの左位置を取得します
   */
  get left(): number {
    return this.x;
  }

  /**
   * ゲームオブジェクトの右位置を取得します
   */
  get right(): number {
    return this.x + this.w;
  }

  /**
   * ゲームオブジェクト同士の衝突判定をします
   * @param a 衝突判定をするゲームオブジェクトA
   * @param b 衝突判定をするゲームオブジェクトB
   * @param t 衝突があったときにさらに衝突判定されないようゲームオブジェクトBの位置を補正する(-1:しない、0:y位置、1:x位置、2:両方。デフォルトは-1で補正しない)
   * @returns 衝突したかどうかを示すboolean値
   */
  static isCollision(a: GameObject, b: GameObject, t: number = -1): boolean {
    if (b.left <= a.right &&
      a.left <= b.right &&
      b.top <= a.bottom &&
      a.top <= b.bottom) {

      //めり込み解消
      if (t === 0 || t === 2) {
        //y方向
        //めり込み具合でどっちから当たったか判別
        if ((a.right - b.left) - (b.right - a.left) >= 0) {
          //左から
          b.x = a.x - b.w - 1
        } else {
          //右から
          b.x = a.x + a.w + 1
        }
      }

      if (t === 1 || t === 2) {
        //x方向
        //めり込み具合でどっちから当たったか判別
        if ((a.bottom - b.top) - (b.bottom - a.top) >= 0) {
          //上から
          b.y = a.y - b.h - 1
        } else {
          //下から
          b.y = a.y + a.h + 1
        }
      }

      return true;
    }

    return false;
  }
}

export class GameBaseSVG extends GameBase {
  svg: any;
  constructor(svgelem: string, func: OnStartCallback | null = null) {
    super(null, func);
    this.svg = document.getElementById(svgelem);
    this._init();
  }
}

export class GameObjectSVG extends GameObject {
  base: GameBaseSVG;
  element: any;
  oldx: number;
  oldy: number;
  oldw: number;
  oldh: number;
  oldimgnum: number;
  oldstate: number;
  oldfill: boolean;

  constructor(_p: GameBaseSVG) {
    super(_p);
    this.base = _p;
    this.element = null;
    this.oldx = 0;
    this.oldy = 0;
    this.oldw = 0;
    this.oldh = 0;
    this.oldstate = 0;
    this.oldimgnum = 0;
    this.oldfill = false;
  }

  isChange(): boolean {
    if (this.x === this.oldx && this.y === this.oldy && this.w === this.oldw && this.h === this.oldh && this.state === this.oldstate && this.imgnum === this.oldimgnum) return false;
    this.oldx = this.x;
    this.oldy = this.y;
    this.oldw = this.w;
    this.oldh = this.h;
    this.oldstate = this.state;
    this.oldimgnum = this.imgnum;
    return true;
  }

  drawRect(color: string, fill: boolean = false) {
    if (!this.base.svg) return;
    if (this.element) {
      if (!this.isChange() && fill === this.oldfill) return;
      this.oldfill = fill;
      if (this.element.tagName !== 'rect') {
        this.base.svg.removeChild(this.element);
        this.element = null;
      }
    }
    if (!this.element) this.element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.base.svg.appendChild(this.element);
    this.element.setAttribute("x", this.x);
    this.element.setAttribute("y", this.y);
    this.element.setAttribute("width", this.w);
    this.element.setAttribute("height", this.h);
    if (fill) {
      this.element.setAttribute("fill", color);
    } else {
      this.element.setAttribute("stroke", color);
    }
  }

  drawEllipse(color: string, fill: boolean = false) {
    if (!this.base.svg) return;
    if (this.element) {
      if (!this.isChange() && fill === this.oldfill) return;
      this.oldfill = fill;
      if (this.element.tagName !== 'ellipse') {
        this.base.svg.removeChild(this.element);
        this.element = null;
      }
    }
    if (!this.element) this.element = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    this.base.svg.appendChild(this.element);
    this.element.setAttribute("cx", this.x + (this.w / 2));
    this.element.setAttribute("cy", this.y + (this.h / 2));
    this.element.setAttribute("rx", this.w / 2);
    this.element.setAttribute("ry", this.h / 2);
    if (fill) {
      this.element.setAttribute("fill", color);
    } else {
      this.element.setAttribute("stroke", color);
    }
  }

  /**
   * 画像を描画します
   */
  drawImage() {
    if (!this.base.svg) return;
    if (this.images.length > this.imgnum && this.images[this.imgnum].loaded) {
      if (this.element) {
        if (!this.isChange()) return;
        if (this.element.tagName !== 'image') {
          this.base.svg.removeChild(this.element);
          this.element = null;
        }
      }

      if (!this.element) this.element = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      let imgobj = this.images[this.imgnum];
      if (imgobj.img) {
        let sx = 0;
        let sy = 0;
        let sw = imgobj.img.width;
        let sh = imgobj.img.height;
        let dw = imgobj.img.width;
        let dh = imgobj.img.height;
        let dx = this.x;
        let dy = this.y;
        if (imgobj.clip) {
          sx = imgobj.clipx;
          sy = imgobj.clipy;
          sw = imgobj.clipw;
          sh = imgobj.cliph;
        }
        if (imgobj.stretch) {
          dw = this.w;
          dh = this.h;
        }
      }
    }
    /*
    if (!this.base.ctx || !this.base.loaded) return;
    const ctx = this.base.ctx;
    if (this.images.length > this.imgnum && this.images[this.imgnum].loaded) {
      let imgobj = this.images[this.imgnum];
      if (imgobj.img) {
        let sx = 0, sy = 0, sw = imgobj.img.width, sh = imgobj.img.height;
        let dw = imgobj.img.width, dh = imgobj.img.height;
        let dx = this.x, dy = this.y
        if (imgobj.clip) {
          sx = imgobj.clipx;
          sy = imgobj.clipy;
          sw = imgobj.clipw;
          sh = imgobj.cliph;
        }
        if (imgobj.stretch) {
          dw = this.w;
          dh = this.h;
        }
        ctx.drawImage(imgobj.img, sx, sy, sw, sh, dx, dy, dw, dh);
      }
    }
    */
  }

  remove(): void {
    if (this.base.svg && this.element) {
      this.base.svg.removeChild(this.element);
      this.element = null;
    }
  }
}
