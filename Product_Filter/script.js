let products = [];
let id = 1;

// ---------- CREATE ----------
function addProducts(name, category, price, rating){
    const newProduct = {
        id: id,
        name: name,
        category: category,
        price: price,
        rating: rating,
    };

    products.push(newProduct);
    id = id + 1;

    console.log("Product Added successfully:", newProduct);
    return newProduct;
}

// ---------- READ ----------
function findProductById(id){
    return products.find(product => product.id === id);
}

function getAllProducts(){
    return products;
}

// ---------- UPDATE ----------
function updateProductById(id, updateFields){
    products = products.map((product) => {
        return product.id === id ? { ...product, ...updateFields } : product;
    });
    console.log("Product Updated:", findProductById(id));
}

// ---------- DELETE ----------
function deleteProductById(id){
    products = products.reduce((result, product) => {
        if (product.id !== id) {
            result.push(product);
        }
        return result;
    }, []);
    console.log("Product deleted. Remaining count:", products.length);
}

// ---------- FILTER ----------
function filterByCategory(category){
    return products.filter(product => product.category === category);
}

function filterByPriceRange(min, max){
    return products.filter(product => product.price >= min && product.price <= max);
}

function filterByMinRating(minRating){
    return products.filter(product => product.rating >= minRating);
}

// ---------- SEARCH ----------
function searchByName(query){
    return products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
    );
}

// debounce: waits until user stops typing before actually searching
function debounce(callback, delay = 500){
    let timer;
    return function (...args){
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

const debouncedSearch = debounce((query) => {
    console.log("Searching for:", query);
    console.log(searchByName(query));
}, 500);

// usage example (in a real app, call this on every keystroke):
// debouncedSearch("lap");

// ---------- SORT ----------
function sortByPrice(order = "asc"){
    return [...products].sort((a, b) =>
        order === "asc" ? a.price - b.price : b.price - a.price
    );
}

function sortByRating(order = "desc"){
    return [...products].sort((a, b) =>
        order === "asc" ? a.rating - b.rating : b.rating - a.rating
    );
}

function sortByName(order = "asc"){
    return [...products].sort((a, b) =>
        order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
}

// ---------- AGGREGATE ----------
function getAveragePrice(){
    if (products.length === 0) return 0;
    const total = products.reduce((sum, product) => sum + product.price, 0);
    return total / products.length;
}

function getUniqueCategories(){
    return [...new Set(products.map(product => product.category))];
}

function groupByCategory(){
    return products.reduce((groups, product) => {
        const key = product.category;
        if (!groups[key]) groups[key] = [];
        groups[key].push(product);
        return groups;
    }, {});
}

function getTopRated(n = 3){
    return [...products].sort((a, b) => b.rating - a.rating).slice(0, n);
}

// ---------- PAGINATION ----------
function paginate(list, page = 1, pageSize = 5){
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
}

// ---------- MASTER FILTER (combines everything above) ----------
function filterProducts(options = {}){
    let result = [...products];

    const {
        category,
        minPrice,
        maxPrice,
        minRating,
        keyword,
        sortBy,
        sortOrder = "asc",
        page,
        pageSize = 5,
    } = options;

    if (category) {
        result = result.filter(p => p.category === category);
    }

    if (minPrice !== undefined) {
        result = result.filter(p => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
        result = result.filter(p => p.price <= maxPrice);
    }

    if (minRating !== undefined) {
        result = result.filter(p => p.rating >= minRating);
    }

    if (keyword) {
        result = result.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    }

    if (sortBy) {
        result = result.sort((a, b) => {
            if (typeof a[sortBy] === "string") {
                return sortOrder === "asc"
                    ? a[sortBy].localeCompare(b[sortBy])
                    : b[sortBy].localeCompare(a[sortBy]);
            }
            return sortOrder === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
        });
    }

    if (page) {
        result = paginate(result, page, pageSize);
    }

    return result;
}   