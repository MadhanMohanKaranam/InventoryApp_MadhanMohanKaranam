export class ToInventory {
    constructor(data, docId) {
        if (!data) return;
        this.name = data.name;
        this.email = data.email;
        this.quantity = data.quantity;
        this.timestamp = data.timestamp;
        this.docId = docId; 
    }

    set_docId(id) {
        this.docId = id;
    }

    toFirestore() {
        return {
            name: this.name,
            email: this.email,
            timestamp: this.timestamp,
            quantity: this.quantity,
        };
    }
}
