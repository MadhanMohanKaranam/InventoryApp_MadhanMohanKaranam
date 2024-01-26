const b1 = document.getElementById('buttonNumber');
const b2 = document.getElementById('buttonName');

b1.onclick = f1;
b2.onclick = function() {
    console.log('Name button is clicked');
}

function f1() {
    console.log('Number button clicked');
}


