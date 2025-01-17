const apiUrl = 'http://localhost:2000/api/inventory';

// Membuat class InventoryManager
class InventoryManager {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    // Mengambil dan menampilkan semua item
    async getItems() {
        try {
            const response = await fetch(this.apiUrl);
            const items = await response.json();
            const inventoryList = document.getElementById('inventory-list');
            inventoryList.innerHTML = '';  // Clear the list before adding new items

            // Menyimpan item dalam array untuk pemrosesan lebih lanjut
            let itemArray = []; 
            for (let i = 0; i < items.length; i++) {
                itemArray.push(items[i]); // Menambahkan item ke array

                const li = document.createElement('li');
                li.innerHTML = `
                    ${itemArray[i].name} - Jumlah: ${itemArray[i].quantity}, Harga: ${itemArray[i].price} - ID: ${itemArray[i].id}
                    <button class="edit-btn" data-id="${itemArray[i].id}">Edit</button>
                    <button class="delete-btn" data-id="${itemArray[i].id}">Hapus</button>
                `;
                inventoryList.appendChild(li);
            }

            // Menambahkan event listener untuk tombol Edit dan Hapus
            this.addEventListeners(); // Menambahkan event listener setiap kali daftar item diperbarui

        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    // Menambahkan item baru
    async addItem(name, quantity, price) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, quantity, price }),
            });

            if (response.ok) {
                const data = await response.json(); // Ambil ID dari respons
                console.log(`Item berhasil ditambahkan dengan ID: ${data.id}`);
                this.getItems(); // Refresh item list
            } else {
                alert('Gagal menambahkan item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Gagal menambahkan item');
        }
    }

    // Fungsi untuk menambahkan event listener pada tombol Edit dan Hapus
    addEventListeners() {
        // Menambahkan event listener untuk tombol Edit
        const editButtons = document.querySelectorAll('.edit-btn');
        for (let i = 0; i < editButtons.length; i++) {
            let button = editButtons[i];
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                this.editItem(id);
            });
        }

        // Menambahkan event listener untuk tombol Hapus
        const deleteButtons = document.querySelectorAll('.delete-btn');
        for (let i = 0; i < deleteButtons.length; i++) {
            let button = deleteButtons[i];
            button.addEventListener('click', (event) => {
                const id = event.target.getAttribute('data-id');
                this.deleteItem(id);
            });
        }
    }

    // Edit item
    async editItem(id) {
        const name = prompt('Edit Nama Barang');
        const quantity = prompt('Edit Jumlah');
        const price = prompt('Edit Harga');

        if (name && quantity && price) {
            try {
                const response = await fetch(`${this.apiUrl}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, quantity, price }),
                });

                if (response.ok) {
                    this.getItems(); // Refresh item list
                } else {
                    alert('Gagal memperbarui item');
                }
            } catch (error) {
                console.error('Error editing item:', error);
                alert('Gagal memperbarui item');
            }
        }
    }

    // Hapus item
    async deleteItem(id) {
        const confirmDelete = confirm('Apakah Anda yakin ingin menghapus item ini?');
        if (confirmDelete) {
            try {
                const response = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    this.getItems(); // Refresh item list
                } else {
                    alert('Gagal menghapus item');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Gagal menghapus item');
            }
        }
    }
}

// Membuat class turunan AdvancedInventoryManager
class AdvancedInventoryManager extends InventoryManager {
    constructor(apiUrl) {
        super(apiUrl);
    }

    // Mencari item berdasarkan nama
    async searchItemByName(name) {
        try {
            const response = await fetch(this.apiUrl);
            const items = await response.json();
            const filteredItems = items.filter(item => item.name.toLowerCase().includes(name.toLowerCase()));

            const inventoryList = document.getElementById('inventory-list');
            inventoryList.innerHTML = '';  // Clear the list before adding new items

            for (let i = 0; i < filteredItems.length; i++) {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${filteredItems[i].name} - Jumlah: ${filteredItems[i].quantity}, Harga: ${filteredItems[i].price} - ID: ${filteredItems[i].id}
                    <button class="edit-btn" data-id="${filteredItems[i].id}">Edit</button>
                    <button class="delete-btn" data-id="${filteredItems[i].id}">Hapus</button>
                `;
                inventoryList.appendChild(li);
            }

            // Menambahkan event listener untuk tombol Edit dan Hapus
            this.addEventListeners(); // Menambahkan event listener setiap kali daftar item diperbarui

        } catch (error) {
            console.error('Error searching items:', error);
        }
    }
}

// Inisialisasi instance dari class AdvancedInventoryManager
const advancedInventoryManager = new AdvancedInventoryManager(apiUrl);

// Ambil data item saat halaman dimuat
advancedInventoryManager.getItems();

// Menambahkan item baru ketika form disubmit
document.getElementById('add-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const quantity = document.getElementById('item-quantity').value;
    const price = document.getElementById('item-price').value;

    advancedInventoryManager.addItem(name, quantity, price);

      // Kosongkan form setelah berhasil menambahkan item
      document.getElementById('add-item-form').reset();  // Reset form
    });
    
    // Menambahkan event listener untuk form pencarian
    document.getElementById('search-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('search-item-name').value;
    
        advancedInventoryManager.searchItemByName(name);
    });