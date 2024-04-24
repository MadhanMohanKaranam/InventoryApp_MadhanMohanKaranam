import { ToInventory } from "../model/ToInventory.js";
import { currentUser } from "./firebase_auth.js";
import { getToInventoryList, addToInventory, deleteToInventory, updateQuantityInFirestore } from "./firestore_controller.js";
import { DEV } from "../model/constants.js";
import { progressMessage } from "../view/progress_message.js";
import { buildCard, homePageView, insertAlphabetically, removeCardFromUI } from "../view/home_page.js";

let inventoryList = null;

export async function onSubmitCreateForm(e) {
    e.preventDefault();
    const buttonLabel = e.submitter.innerHTML;
    e.submitter.disabled = true;
    e.submitter.innerHTML = ' Wait...';

    const name = e.target.title.value.toLowerCase();
    const email = currentUser.email;
    const timestamp = Date.now();

    try {
        if (!inventoryList) {
            inventoryList = await getToInventoryList(email);
        }

        const existingItem = inventoryList.find(item => item.name === name);
        if (existingItem) {
            alert(`${existingItem.name} already exists. Cannot create a new one.`);
            return;
        }

        const quantity = 1;
        const toInventory = new ToInventory({ email, name, timestamp, quantity });

        const progress = progressMessage('Creating...');
        e.target.prepend(progress);

        const docId = await addToInventory(toInventory);
        toInventory.set_docId(docId);
        progress.remove();

        const container = document.getElementById('todo-container');
        container.prepend(buildCard(toInventory));
        e.target.title.value = '';
    } catch (error) {
        console.error('Failed to create item:', error);
        alert('Failed to create item. Please try again.');
    } finally {
        e.submitter.innerHTML = buttonLabel;
        e.submitter.disabled = false;
    }
}

export function onClickIncrement(e) {
    const button = e.target;
    const quantityElement = button.parentElement.querySelector('p');
    let quantity = parseInt(quantityElement.textContent);

    if (button.textContent === '+') {
        quantity++;
    } else if (button.textContent === '-') {
        quantity = Math.max(0, quantity - 1);
    }

    quantityElement.textContent = quantity.toString();
}

export async function onClickUpdate(e, toInventory) {
    e.preventDefault();
    const card = document.getElementById(toInventory.docId);
    const quantityElement = card.querySelector('p');
    const quantity = parseInt(quantityElement.textContent);
    const docId = toInventory.docId;

    if (quantity === 0) {
        const r = confirm('Are you sure you want to delete this item permanently?');
        if (!r) return;

        try {
            await deleteToInventory(docId);
            removeCardFromUI(toInventory);
            homePageView();
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item. Please try again.');
        }
    } else {
        try {
            await updateQuantityInFirestore(docId, { quantity });
            alert('Item quantity updated successfully!');
            const updatedInventory = await getToInventoryList(currentUser.email);
            const updatedItem = updatedInventory.find(item => item.docId === docId);
            if (updatedItem) {
                quantityElement.textContent = updatedItem.quantity.toString();
            }
        } catch (error) {
            console.error('Failed to update item quantity:', error);
            alert('Failed to update item quantity. Please try again.');
        }
    }
}

export async function onClickCancel(e, toInventory) {
    const card = document.getElementById(toInventory.docId);
    const quantityElement = card.querySelector('p');
    
    try {
        const updatedInventory = await getToInventoryList(currentUser.email);
        const updatedItem = updatedInventory.find(item => item.docId === toInventory.docId);
        if (updatedItem) {
            quantityElement.textContent = updatedItem.quantity.toString();
        }
    } catch (error) {
        console.error('Failed to retrieve item quantity:', error);
        alert('Failed to retrieve item quantity. Please try again.');
    }
}
