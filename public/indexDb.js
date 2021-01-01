// This creates a new database called "budget".
const newDB = indexedDB.open("budget", 1);


// Function creates object store and set autoIncrement to true. This will be used for updates that need to be implemented later. Thus why the object store is called "pending"
newDB.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

// Function that checks if app is online before reading from the database.
newDB.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        retrieveDatabase();
    }
};

// Catches errors for the above process.
newDB.onerror = function (event) {
    console.log("Something Went Wrong! " + event.target.errorCode);
};

// Function that opens transaction(s) pending on the DB byt accessing the object store. Uses 'getAll' to retrieve all records from the store and sets to a variable. Then when successful all items in store become cleared since they are no longer needed.
function retrieveDatabase() {

    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {

                    const transaction = db.transaction(["pending"], "readwrite");

                    const store = transaction.objectStore("pending");

                    store.clear();
                });
        }
    };
};

// 
function saveNewTrans(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");

    // access your pending object store
    const store = transaction.objectStore("pending");

    // add record to your store with add method.
    store.add(record);
}








// Listens for app coming back online.
window.addEventListener("online", retrieveDatabase);