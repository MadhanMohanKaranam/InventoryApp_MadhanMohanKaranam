import {
    getFirestore,
    collection,
    addDoc,
    query,where,
    orderBy,
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const TO_INVENTORY = 'to_inventory';
import { app } from "./firebase_core.js";
import { ToInventory } from "../model/Inventory.js";

const db = getFirestore(app);

export async function addInventory(toInventory){
        const docRef = await addDoc(collection(db,TO_INVENTORY),toInventory.toFirestore());
        return docRef.id;
}

export async function getInventoryList(email){
        let inventoryList = [];
        const coll = collection(db, TO_INVENTORY)
        const q = query(coll, 
            where('email', '==', email), 
            orderBy('name', 'asc'),);
        const snapShot = await getDocs(q);
        snapShot.forEach( doc => {
            const p = new ToInventory(doc.data(),doc.id);
            inventoryList.push(p);
        });
        return inventoryList;
}

export async function deleteInventory(docId) {
    const docRef = doc(db, TO_INVENTORY, docId);
    await deleteDoc(docRef); // Return the docId after deletion for reference
}

export async function updateQuantityInFirestore(docId, update){
    const docRef =  doc(db,TO_INVENTORY,docId);
    await updateDoc(docRef,update);
}





