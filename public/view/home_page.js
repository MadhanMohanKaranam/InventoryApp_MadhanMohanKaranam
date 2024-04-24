import { currentUser } from "../controller/firebase_auth.js";
import { root } from "./elements.js";
import { protectedView } from "./protected_view.js";
import { onSubmitCreateForm, onClickIncrement, onClickUpdate, onClickCancel } from "../controller/home_controller.js";
import { getToInventoryList } from "../controller/firestore_controller.js";
import { DEV } from "../model/constants.js";

let inventoryList = null;

export function removeCardFromUI(toInventory) {
    const index = inventoryList.findIndex(item => item.docId === toInventory.docId);
    if (index >= 0) {
        inventoryList.splice(index, 1);
    }
}

export function insertAlphabetically(item) {
    let index = 0;
    while (index < inventoryList.length && item.name > inventoryList[index].name) {
        index++;
    }
    inventoryList.splice(index, 0, item);
}

export function resetInventoryList() {
    inventoryList = null;
}

export async function homePageView() {
    if (!currentUser) {
        root.innerHTML = await protectedView();
        return;
    }

    const response = await fetch('/view/templates/home_page_template.html', { cache: 'no-store' });
    const divWrapper = document.createElement('div');
    divWrapper.innerHTML = await response.text();
    divWrapper.classList.add('m-4', 'p-4');
    const form = divWrapper.querySelector('form');
    form.onsubmit = onSubmitCreateForm;
    const todoContainer = divWrapper.querySelector('#todo-container');
    root.innerHTML = '';
    root.appendChild(divWrapper);

    if (inventoryList === null) {
        todoContainer.innerHTML = '<h2>Loading...</h2>';

        try {
            inventoryList = await getToInventoryList(currentUser.email);
        } catch (error) {
            todoContainer.innerHTML = '';
            if (DEV) console.error('Failed to get Inventory List:', error);
            alert('Failed to get Inventory list: ' + JSON.stringify(error));
            return;
        }
    }

    if (inventoryList.length === 0) {
        todoContainer.innerHTML = '<h2>No Item has been added!</h2>';
        return;
    }

    todoContainer.innerHTML = '';
    inventoryList.forEach(item => {
        todoContainer.appendChild(buildCard(item));
    });
}

export function buildCard(toInventory) {
    const div = document.createElement('div');
    div.classList.add('card', 'd-inline-block');
    div.style.width = "25rem";
    div.innerHTML = `
        <div id="${toInventory.docId}" class="card-container">
            <span class="fs-3 card-title" style="margin-left: 12px;">${toInventory.name}</span>
            <div class="card-body">
                <button class="btn btn-outline-danger">-</button>
                <p style="display: inline-block;">${toInventory.quantity}</p>
                <button class="btn btn-outline-primary">+</button>
                <button class="btn btn-outline-primary" style="margin-left: 8px;">Update</button>
                <button class="btn btn-outline-secondary">Cancel</button>
            </div>
        </div>
    `;

    div.querySelector('.btn-outline-danger').onclick = onClickIncrement;
    div.querySelector('.btn-outline-primary').onclick = onClickIncrement;
    div.querySelector('.btn-outline-primary:nth-child(3)').onclick = e => onClickUpdate(e, toInventory);
    div.querySelector('.btn-outline-secondary').onclick = e => onClickCancel(e, toInventory);

    return div;
}
