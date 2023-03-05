type SortFunc = (a: number, b: number) => number;

//トランプ管理クラス
export default class Trump {
  deck: Array<number> = [];
  player: Array<Array<number>> = [];
  joker: string = 'JKR';
  number: Array<string> = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', this.joker];
  suithtml: Array<string> = ['<span style="color:black;">♠</span>', '<span style="color:red;">♥</span>', '<span style="color:red;">♦</span>', '<span style="color:black;">♣</span>', ''];
  suit: Array<string> = ['♠', '♥', '♦', '♣', ''];
  rank: Array<number> = [12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];

  //コンストラクタ
  constructor(players: number = 0, jokers: number = 1, shuffle: boolean = true) {
    this.init(players, jokers, shuffle);
  }

  //現在のカード状態を全て破棄して初期化(players:プレイヤー数、jokers:ジョーカーの枚数2枚まで、shuffle:シャッフルするか)
  init(players: number = 0, jokers: number = 1, shuffle: boolean = true): void {
    this.deck = [];
    this.player = [];

    if (jokers < 0) jokers = 0;
    if (jokers > 2) jokers = 2;

    for (let i = 0; i < 52 + jokers; i++) {
      this.deck.push(i);
    }

    if (players > 0) {
      for (let i = 0; i < players; i++) {
        this.player.push([]);
      }
    }

    if (shuffle) {
      this.shuffle();
    }
  }

  //デッキまたはプレイヤーのカードをシャッフル(0未満:デッキ, 0以上:プレーヤー)
  shuffle(play: number = -1, times: number = 10000): void {
    if (play >= this.player.length) return;
    let playary = play < 0 ? this.deck : this.player[play];

    if (playary.length <= 0) return;

    for (let i = 0; i < times; i++) {
      let rnd = Math.floor(Math.random() * playary.length);
      let buf = playary[0];
      playary[0] = playary[rnd];
      playary[rnd] = buf;
    }
  }

  //デッキまたはプレイヤーのカードをカード番号順にソートする
  sortCard(play: number): void {
    if (play >= this.player.length) return;
    let playary = play < 0 ? this.deck : this.player[play];
    playary.sort(function (a, b) {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  //デッキまたはプレイヤーのカードを数値→スートの順にソートする
  sortCardNumber(play: number): void {
    if (play >= this.player.length) return;
    let playary = play < 0 ? this.deck : this.player[play];
    playary.sort(function (a, b) {
      let anum = a > 51 ? 13 : a % 13;
      let bnum = b > 51 ? 13 : b % 13;
      let asu = Math.floor(a / 13);
      let bsu = Math.floor(b / 13);
      if (anum < bnum) return -1;
      if (anum > bnum) return 1;
      if (asu < bsu) return -1;
      if (asu > bsu) return 1;
      return 0;
    });
  }

  //デッキまたはプレイヤーのカードを独自の関数を設定してソートする
  sortFunction(play: number, func: SortFunc): void {
    if (play >= this.player.length) return;
    let playary = play < 0 ? this.deck : this.player[play];
    playary.sort(func);
  }

  //デッキまたはプレイヤーのカードの最初(一番上)をデッキまたは別のプレーヤーに渡す
  sendCard(from: number, to: number): boolean {
    if (from >= this.player.length) return false;
    if (to >= this.player.length) return false;
    let fromary = from < 0 ? this.deck : this.player[from];
    let toary = to < 0 ? this.deck : this.player[to];
    if (fromary.length === 0) return false;
    toary.unshift(fromary.shift() as any);
    return true;
  }

  //デッキまたはプレイヤーのカードの指定枚目をデッキまたは別のプレイヤーの(指定枚目)に渡す
  sendCardIndex(from: number, findex: number, to: number, tindex: number = 0) {
    if (from >= this.player.length) return false;
    if (to >= this.player.length) return false;
    let fromary = from < 0 ? this.deck : this.player[from];
    let toary = to < 0 ? this.deck : this.player[to];
    if (findex < 0 || findex >= fromary.length) return false;
    if (tindex < 0) return false;
    if (fromary.length === 0) return false;
    toary.splice(tindex, 0, fromary.splice(findex, 1)[0]);
    return true;
  }

  //デッキまたは現在のプレイヤーのカード所持枚数をチェック
  getCardCount(play: number): number {
    if (play >= this.player.length) return -1;
    let playary = play < 0 ? this.deck : this.player[play];
    return playary.length;
  }

  //デッキまたはプレイヤーのカードの状態を表す配列(コピー)を取得
  getCardArray(play: number): Array<number> | null {
    if (play >= this.player.length) return null;
    let playary = play < 0 ? this.deck : this.player[play];
    let result = [];
    for (let i = 0; i < playary.length; i++) {
      result.push(playary[i]);
    }
    return result;
  }

  //カードのランクを取得(ジョーカー→A→K～2の順に強さを判定する)
  getRank(card: number) {
    return this.rank[this.getRawNumber(card)];
  }

  //カード番号からスートを表す番号を取得
  getSuit(card: number): number {
    if (card < 0 || card > 53) return -1;
    if (card === 52 || card === 53) return 4;
    return Math.floor(card / 13);
  }

  //カード番号からカードの数値を取得(0オリジン)
  getRawNumber(card: number): number {
    if (card < 0 || card > 53) return -1;
    if (card === 52 || card === 53) return 13;
    return card % 13;
  }

  //カード番号からカードの数値を取得(1オリジン)
  getNumber(card: number): number {
    return this.getRawNumber(card) + 1;
  }

  //カード番号からカードを示す文字列を取得
  getCardString(card: number): string {
    if (card < 0 || card > 53) return '';
    if (card === 52 || card === 53) return this.joker;
    return this.suit[Math.floor(card / 13)] + this.number[card % 13];
  }

  //カード番号からカードを示すHTML文字列を取得
  getCardHtml(card: number): string {
    if (card < 0 || card > 53) return '';
    if (card === 52 || card === 53) return this.joker;
    return this.suithtml[Math.floor(card / 13)] + '<br>' + this.number[card % 13];
  }
}
