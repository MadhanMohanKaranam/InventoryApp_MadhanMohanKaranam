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
    const index = inventoryList.findIndex(existingItem => item.name <= existingItem.name);
    if (index === -1) {
        inventoryList.push(item);
    } else {
        inventoryList.splice(index, 0, item);
    }
}


export async function homePageView() {
    if (!currentUser) {
        root.innerHTML = await protectedView();
        return;
    }

    const response = await fetch('/view/templates/home_page_template.html', { cache: 'no-store' });
    const templateHTML = await response.text();

    const divWrapper = document.createElement('div');
    divWrapper.innerHTML = templateHTML;
    divWrapper.classList.add('m-4', 'p-4');

    const form = divWrapper.querySelector('form');
    form.addEventListener('submit', onSubmitCreateForm);

    const todoContainer = divWrapper.querySelector('#todo-container');
    root.innerHTML = '';
    root.appendChild(divWrapper);

    if (inventoryList === null) {
        todoContainer.innerHTML = '<h2>Loading...</h2>';
        try {
            inventoryList = await getInventoryList(currentUser.email);
        } catch (e) {
            todoContainer.innerHTML = '';
            if (DEV) console.log('failed to get Inventory List', e);
            alert('Failed to get Inventory list:' + JSON.stringify(e));
            return;
        }
    }

    if (inventoryList.length === 0) {
        todoContainer.innerHTML = '<h2>No Item has been added!</h2>';
        return;
    }

    todoContainer.innerHTML = '';
    inventoryList.forEach(item => {
        todoContainer.appendChild(buildItem(item));
    });
}

export function buildItem(toInventory) {
    const container = document.createElement('div');
    container.classList.add('card', 'd-inline-block');
    container.style.width = '25rem';

    const cardContent = `
        <div id="${toInventory.docId}" class="card-container">
            <span class="fs-3 card-title" style="margin-left: 12px;">${toInventory.name}</span>
            <div class="card-body">
                <button id="btn1" class="btn btn-outline-danger" data-action="decrement">-</button>
                <p style="display: inline-block;" id="quant">${toInventory.quantity}</p>
                <button id="btn2" class="btn btn-outline-primary" data-action="increment">+</button>
                <button id="btn3" class="btn btn-outline-primary" data-action="update" style="margin-left: 8px;">Update</button>
                <button id="btn4" class="btn btn-outline-secondary" data-action="cancel">Cancel</button>
            </div>
        </div>
    `;

    container.innerHTML = cardContent;

    const button1 = container.querySelector('#btn1');
    const button2 = container.querySelector('#btn2');
    button1.onclick =  onClickIncrement
    button2.onclick =  onClickIncrement
    const button3 = container.querySelector('#btn3');
    button3.onclick = (e) => onClickUpdate(e, toInventory);
    const button4 = container.querySelector('#btn4');
    button4.onclick = (e) => onClickCancel(e, toInventory);

    return container;
}

