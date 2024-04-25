export function creatingMessage(message){
    const div = document.createElement('div');
    div.innerHTML = `<h4 class="text-white bg-success">${message}</h4>`;
    return div;
}