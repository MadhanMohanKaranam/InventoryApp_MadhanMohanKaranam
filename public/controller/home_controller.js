import { ToInventory } from "../model/Inventory.js";
import { currentUser } from "./firebase_auth.js";
import { getInventoryList, addInventory, deleteInventory, updateQuantityInFirestoreDatabase } from "./firestore_controller.js";
import { DEV } from "../model/constants.js";
import { creatingMessage } from "../view/creating_message.js";
import { buildItem, homePageView, insertAlphabeticalWise, removeItem } from "../view/home_page.js";



export async function onSubmitCreateForm(e) {
    e.preventDefault();

    // Validation
    const name = e.target.title.value.trim().toLowerCase();
    if (!name) {
        alert('Please enter a valid name.');
        return;
    }

    let progress = creatingMessage('creating...');
    e.target.prepend(progress);

    const email = currentUser.email;
    const timestamp = Date.now();

    try {
        // Check if item already exists
        const inventoryList = await getInventoryList(email);
        const existingItem = inventoryList.find(item => item.name === name);
        if (existingItem) {
            throw new Error(`${existingItem.name} already exists. Cannot create a new one.`);
        }

        // Create new item
        const toInventory = new ToInventory({ email, name, timestamp, quantity: 1 });
        const docId = await addInventory(toInventory);
        toInventory.set_docId(docId);

        // Update UI
        const container = document.getElementById('todo-container');
        container.prepend(buildItem(toInventory));
        insertAlphabeticalWise(toInventory);
        homePageView();

    } catch (error) {
        //console.error('Failed to create item:', error);
        alert('Failed to create item: ' + error.message);
    } 

    // Clear input field
    e.target.title.value = '';
}



export async function onClickIncrement(e) {
    // Ensure the target element is a button
    if (e.target.tagName !== 'BUTTON') {
        console.error('Invalid target element. Expected a button.');
        return;
    }

    const button = e.target;
    const quantityElement = button.parentElement.querySelector('p');
    let quantity = parseInt(quantityElement.innerText);

    if (button.innerText === '+') {
        quantity++;
    } else if (button.innerText === '-') {
        // Ensure quantity is not reduced below zero
        if (quantity > 0) {
            quantity--;
        } else {
            // Provide feedback to the user when trying to reduce quantity below zero
            alert('Quantity cannot be less than zero.');
            return;
        }
    }

    quantityElement.innerText = quantity.toString();
}

export async function onClickUpdate(e, toInventory) {
    e.preventDefault(e);

    const card = document.getElementById(toInventory.docId);
    const quantityElement = card.querySelector('p');
    let quantity = parseInt(quantityElement.textContent);
    const docId = toInventory.docId;

    if (quantity === 0) {
        const confirmation = confirm('Are you sure you want to delete this item permanently?');
        if (!confirmation) return;

        const deleteResult = await deleteItem(docId);
        if (deleteResult.success) {
            removeItem(toInventory);
            homePageView();
            alert('Item deleted successfully!');
        } else {
            console.error('Failed to delete item:', deleteResult.error);
            alert('Failed to delete item: ' + JSON.stringify(deleteResult.error));
        }
    } else {
        const updateResult = await updateQuantity(docId, quantity);
        if (updateResult.success) {
            alert('Item quantity updated ');
        } else {
            console.error('Failed to update item quantity:', updateResult.error);
            alert('Failed to update item quantity: ' + JSON.stringify(updateResult.error));
        }
    }
}

async function deleteItem(docId) {
    try {
        await deleteInventory(docId);
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

async function updateQuantity(docId, newQuantity) {
    try {
        await updateQuantityInFirestoreDatabase(docId, { quantity: newQuantity });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function onClickCancel(e, toInventory) {

    //const quantityElement = document.getElementById(toInventory.docId).querySelector('p');
    const card = document.getElementById(toInventory.docId);
    const quantityElement = card.querySelector('p');

    
    try {
        const updatedItem = await fetchUpdatedItem(currentUser.email, toInventory.docId);
        if (updatedItem) {
            quantityElement.textContent = updatedItem.quantity.toString();
        }
    } catch (error) {
        console.error('Failed to retrieve quantity:', error);
        alert('Failed to retrieve quantity: ' + JSON.stringify(error));
    }
}

async function fetchUpdatedItem(email, card) {
    try {
        const updatedInventory = await getInventoryList(email);
        return updatedInventory.find(item => item.docId === card);
    } catch (error) {
        throw error;
    }
}

