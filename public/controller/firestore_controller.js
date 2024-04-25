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
    try {
        const docRef = await addDoc(collection(db, 'to_inventory'), toInventory.toFirestore());
        return docRef.id;
    } catch (error) {
        console.error("Error adding inventory:", error);
        throw error;
    }
}

export async function getInventoryList(email){
    try {
        const snapshot = await getDocs(query(collection(db, 'to_inventory'), where('email', '==', email), orderBy('name', 'asc')));
        return snapshot.docs.map(doc => new ToInventory(doc.data(), doc.id));
    } catch (error) {
        console.error("Error getting inventory list:", error);
        throw error;
    }
}

export async function deleteInventory(docId) {
    try {
        await deleteDoc(doc(db, 'to_inventory', docId));
        return docId; // Return the docId after deletion for reference
    } catch (error) {
        console.error("Error deleting inventory:", error);
        throw error;
    }
}

export async function updateQuantityInFirestoreDatabase(docId, update){
    try {
        await updateDoc(doc(db, 'to_inventory', docId), update);
    } catch (error) {
        console.error("Error updating quantity in Firestore database:", error);
        throw error;
    }
}





