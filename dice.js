export class Dice {
    constructor(_min = 1, _max = 6) {
        this.min = _min;
        this.max = _max;
        this.num = -1;
    }
    setnum(num) {
        if (num < this.min)
            num = this.min;
        if (num > this.max)
            num = this.max;
        this.num = num;
    }
    getnum() {
        return this.num;
    }
    roll() {
        this.num = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
        return this.num;
    }
    rollSum(times) {
        let result = 0;
        for (let i = 0; i < times; i++) {
            result += this.roll();
        }
        return result;
    }
    rollArray(times) {
        let result = [];
        for (let i = 0; i < times; i++) {
            result.push(this.roll());
        }
        return result;
    }
}
export class DiceHtml extends Dice {
    constructor(_id) {
        super(1, 6);
        if (typeof _id === 'string') {
            this.element = document.getElementById(_id);
        }
        else {
            this.element = _id;
        }
        if (this.element)
            this.element.innerHTML = DiceHtml.baseHTML;
    }
    roll() {
        let result = super.roll();
        this.setdice(result);
        return result;
    }
    async rollview(times = 100) {
        let result = -1;
        for (let i = 0; i < times; i++) {
            result = this.roll();
            await new Promise(s => setTimeout(s, 10));
        }
        return result;
    }
    //1個のダイス表示と結びついているので1個分だけ
    rollSum(times = 1) {
        return this.roll();
    }
    //1個のダイス表示と結びついているので1個分だけ
    rollArray(times = 1) {
        let result = [];
        result.push(this.roll());
        return result;
    }
    setnum(num) {
        super.setnum(num);
        this.setdice(this.num);
    }
    setdice(num) {
        if (num < 1 || num > 6)
            return;
        let elementarr = [];
        for (let i = 0; i < 9; i++) {
            if (this.element)
                this.element.getElementsByClassName('dicepiece' + i)[0].innerHTML = DiceHtml.pieceSVG[DiceHtml.dicenum[num][i]];
        }
    }
}
//svgはdivで挟むとなぜかサイズが小さいときにズレるので直接定義
DiceHtml.baseHTML = `
<div style="float:left;width:100%;height:5%;"></div>
<div style="float:left;width:5%;height:30%;"></div>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece0" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece1" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece2" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<div style="float:left;width:5%;height:30%;"></div>
<div style="float:left;width:5%;height:30%;"></div>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece3" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece4" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece5" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<div style="float:left;width:5%;height:30%;"></div>
<div style="float:left;width:5%;height:30%;"></div>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece6" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece7" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<svg style="float:left;width:30%;height:30%;" class="dice dicepiece8" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"></svg>
<div style="float:left;width:5%;height:30%;"></div>
<div style="float:left;width:100%;height:5%;"></div>
<div style="clear:both;width:0;height:0;"></div>
  `.trim();
DiceHtml.pieceSVG = [
    '',
    '<circle cx="50" cy="50" r="30" fill="black" />',
    '<circle cx="50" cy="50" r="50" fill="red" />',
];
DiceHtml.dicenum = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
];
