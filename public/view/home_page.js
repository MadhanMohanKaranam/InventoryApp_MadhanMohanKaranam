import { currentUser } from "../controller/firebase_auth.js";
import { root } from "./elements.js";
import { protectedView } from "./protected_view.js";
import { onSubmitCreateForm, onClickIncrement, onClickUpdate,onClickCancel } from "../controller/home_controller.js";
import { getInventoryList } from "../controller/firestore_controller.js";
import { DEV } from "../model/constants.js";

let inventoryList = null;

export function removeItem(toInventory) {
    const index = inventoryList.findIndex(p => p.docId == toInventory.docId);
    if(index >= 0)
        inventoryList.splice(index,1);
}
export function insertAlphabeticalWise(item) {
    let index = 0;
    while (index < inventoryList.length && item.name > inventoryList[index].name) {
        index++;
    }
    inventoryList.splice(index, 0, item);
}



export function resetInventoryList(){
    inventoryList =null;
}
export async function homePageView() {
    if (!currentUser) {
        root.innerHTML = await protectedView();
        return;
    }

    const response = await fetch('/view/templates/home_page_template.html',
        { cache: 'no-store' });
    const divWrapper = document.createElement('div');
    divWrapper.innerHTML = await response.text();
    divWrapper.classList.add('m-4', 'p-4')
    const form = divWrapper.querySelector('form');
    form.onsubmit = onSubmitCreateForm;
    let todocontainer = divWrapper.querySelector('#todo-container');
    root.innerHTML = '';
    root.appendChild(divWrapper);

    ;
    if (inventoryList    == null) {
        todocontainer.innerHTML = '<h2>Loading...</h2>';

        try {
            inventoryList = await getInventoryList(currentUser.email);
        } catch (e) {
            todocontainer.innerHTML = '';
            if (DEV) console.log('failed to get Inventory List', e);
            alert('Failed to get Inventory list:' + JSON.stringify(e));
            return;
        }
    }
    if(inventoryList.length == 0){
        todocontainer.innerHTML = '<h2>No Item has been added!</h2>';   
        return;
    }
    todocontainer.innerHTML ='';

    console.log(inventoryList);
    inventoryList.forEach(title => {
        todocontainer.appendChild(buildItem(title));
    });
    

}

export function buildItem(toInventory) {
    const div = document.createElement('div');
    div.classList.add('card', 'd-inline-block');
    div.style = "width: 25rem;";
    div.innerHTML = `
    <div id="${toInventory.docId}" class="card-container">
    <span class="fs-3 card-title"  style="margin-left: 12px;">${toInventory.name}</span>
    <div class="card-body">
        <button id="btn1" class="btn btn-outline-danger">-</button>
        <p id= "quantity" style="display: inline-block;">${toInventory.quantity}</p>
        <button id= "btn2" class="btn btn-outline-primary" >+</button>
        <button id= "btn3" class="btn btn-outline-primary" style="margin-left: 8px;">update</button>
        <button id= "btn4" class="btn btn-outline-secondary" >Cancel</button>
    </div>
</div>
    `;
    const button1 = div.querySelector('#btn1');
    const button2 = div.querySelector('#btn2');
    button1.onclick = onClickIncrement;
    button2.onclick = onClickIncrement;
    const button3 = div.querySelector('#btn3');
    button3.onclick = e => onClickUpdate(e,toInventory);
    const button4 = div.querySelector('#btn4');
    button4.onclick = e => onClickCancel(e, toInventory);
    return div;
}

