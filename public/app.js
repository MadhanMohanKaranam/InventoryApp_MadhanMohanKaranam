const b1 = document.getElementById('buttonNumber');
const b2 = document.getElementById('buttonName');
const rootEl = document.getElementById('root');

b1.onclick = f1;
b2.onclick = function() {
    rootEl.innerHTML = 'my name is <b>madhan</b>';
}

function f1() {
    const r1 = Math.random();
    const n1 = Math.floor(r1 * 100);
    const r2 = Math.random();
    const n2 = Math.floor(r2 * 100);

    rootEl.innerHTML = 'your lucky numbers are ' + n1 + ' and ' + n2;

}


