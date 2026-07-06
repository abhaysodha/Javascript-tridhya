let products = [];
let id = 1;

// ---------- CREATE ----------
function addProducts(name, category, price, rating){
    const newProduct = { id: id, name: name, category: category, price: price, rating: rating };
    products.push(newProduct);
    id = id + 1;
    return newProduct;
}

// ---------- READ ----------
function findProductById(id){
    return products.find(product => product.id === id);
}

// ---------- UPDATE ----------
function updateProductById(id, updateFields){
    products = products.map(product =>
        product.id === id ? { ...product, ...updateFields } : product
    );
}

// ---------- DELETE ----------
function deleteProductById(id){
    products = products.filter(product => product.id !== id);
}

// ---------- FILTER ----------
function filterByCategory(category){
    return products.filter(product => product.category === category);
}

function filterByPriceRange(min, max){
    return products.filter(product => product.price >= min && product.price <= max);
}

// ---------- SEARCH ----------
function searchByName(query){
    return products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
    );
}

function debounce(callback, delay = 400){
    let timer;
    return function (...args){
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
}

// ---------- SORT ----------
function sortByField(list, field, order = "asc"){
    return [...list].sort((a, b) => {
        if (typeof a[field] === "string") {
            return order === "asc"
                ? a[field].localeCompare(b[field])
                : b[field].localeCompare(a[field]);
        }
        return order === "asc" ? a[field] - b[field] : b[field] - a[field];
    });
}

// ---------- AGGREGATE ----------
function getUniqueCategories(){
    return [...new Set(products.map(product => product.category))];
}

// ---------- MASTER FILTER ----------
function filterProducts(options = {}){
    let result = [...products];
    const { category, minPrice, maxPrice, keyword, sortBy, sortOrder = "asc" } = options;

    if (category) result = result.filter(p => p.category === category);
    if (minPrice !== undefined && minPrice !== "") result = result.filter(p => p.price >= minPrice);
    if (maxPrice !== undefined && maxPrice !== "") result = result.filter(p => p.price <= maxPrice);
    if (keyword) result = result.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    if (sortBy) result = sortByField(result, sortBy, sortOrder);

    return result;
}

// =========================================================
// UI CODE BELOW - connects the functions above to the page
// =========================================================

function renderProducts(list){
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    list.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price}</td>
            <td>${product.rating}</td>
            <td>
                <button onclick="handleDelete(${product.id})" class="delete-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function refreshCategoryDropdown(){
    const select = document.getElementById("categoryFilter");
    const currentValue = select.value;
    const categories = getUniqueCategories();

    select.innerHTML = `<option value="">All</option>`;
    categories.forEach(cat => {
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    select.value = currentValue;
}

function applyCurrentFilters(){
    const category = document.getElementById("categoryFilter").value;
    const minPrice = document.getElementById("minPriceInput").value;
    const maxPrice = document.getElementById("maxPriceInput").value;
    const keyword = document.getElementById("searchInput").value;
    const sortBy = document.getElementById("sortBySelect").value;
    const sortOrder = document.getElementById("sortOrderSelect").value;

    const result = filterProducts({
        category,
        minPrice: minPrice === "" ? undefined : Number(minPrice),
        maxPrice: maxPrice === "" ? undefined : Number(maxPrice),
        keyword,
        sortBy,
        sortOrder,
    });

    renderProducts(result);
}

function handleAddProduct(){
    const name = document.getElementById("nameInput").value.trim();
    const category = document.getElementById("categoryInput").value.trim();
    const price = Number(document.getElementById("priceInput").value);
    const rating = Number(document.getElementById("ratingInput").value);

    if (!name || !category || !price) {
        alert("Please fill name, category and price");
        return;
    }

    addProducts(name, category, price, rating);

    document.getElementById("nameInput").value = "";
    document.getElementById("categoryInput").value = "";
    document.getElementById("priceInput").value = "";
    document.getElementById("ratingInput").value = "";

    refreshCategoryDropdown();
    applyCurrentFilters();
}

function handleDelete(id){
    deleteProductById(id);
    refreshCategoryDropdown();
    applyCurrentFilters();
}

function handleFilterChange(){
    applyCurrentFilters();
}

const handleSearchInput = debounce(() => {
    applyCurrentFilters();
}, 400);

function resetFilters(){
    document.getElementById("categoryFilter").value = "";
    document.getElementById("minPriceInput").value = "";
    document.getElementById("maxPriceInput").value = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("sortBySelect").value = "";
    document.getElementById("sortOrderSelect").value = "asc";
    applyCurrentFilters();
}

// ---------- Starter data so the table isn't empty on load ----------
addProducts("Laptop", "Electronics", 55000, 4.5);
addProducts("Phone", "Electronics", 25000, 4.2);
addProducts("T-Shirt", "Clothing", 500, 3.8);
addProducts("Jeans", "Clothing", 1200, 4.0);
addProducts("Watch", "Accessories", 4500, 4.3);

refreshCategoryDropdown();
renderProducts(products);