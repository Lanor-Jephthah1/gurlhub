/**
 * PRODUCTS PAGE LOGIC
 */

let filteredProducts = [...products];
let currentFilters = {
    categories: ['all'],
    minPrice: 0,
    maxPrice: 500,
    sortBy: 'featured'
};

// Initialize products page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-grid')) {
        // Check for filter from session
        const filterFromSession = sessionStorage.getItem('productFilter');
        if (filterFromSession) {
            applySessionFilter(filterFromSession);
            sessionStorage.removeItem('productFilter');
        }
        
        renderProducts();
        updateProductCount();
    }
});

// Apply filter from navigation
function applySessionFilter(category) {
    const checkboxes = document.querySelectorAll('input[name="category"]');
    checkboxes.forEach(cb => {
        if (cb.value === 'all') {
            cb.checked = false;
        } else if (cb.value === category) {
            cb.checked = true;
        } else {
            cb.checked = false;
        }
    });
    
    currentFilters.categories = [category];
    filterProducts();
}

// Render products
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="far fa-sad-tear" style="font-size: 3rem; color: #ccc; margin-bottom: 20px; display: block;"></i>
                <h3>No Products Found</h3>
                <p style="color: #666; margin-top: 10px;">Try adjusting your filters</p>
                <button class="btn btn-gold" onclick="clearFilters()" style="margin-top: 20px;">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animation = 'fadeInUp 0.5s ease';
    
    const isNew = product.id <= 3;
    const isSale = product.id === 3;
    
    card.innerHTML = `
        <div class="product-image">
            ${isNew ? '<span class="tag">Hot</span>' : ''}
            ${isSale ? '<span class="tag sale">Sale</span>' : ''}
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <button class="quick-view-btn" onclick="openQuickView(${product.id})">
                <i class="far fa-eye"></i> Quick View
            </button>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Bag</button>
        </div>
        <div class="product-details">
            <span class="cat">${product.category}</span>
            <h4>${product.name}</h4>
            <div class="price" data-price="${product.price}">${formatPrice(product.price)}</div>
        </div>
    `;
    
    return card;
}

// Filter products
function filterProducts() {
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    const minPrice = parseFloat(document.getElementById('min-price')?.value || 0);
    const maxPrice = parseFloat(document.getElementById('max-price')?.value || 9999);
    
    // Get selected categories
    let selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
    
    // If "all" is checked, show all
    if (selectedCategories.includes('all') || selectedCategories.length === 0) {
        selectedCategories = products.map(p => p.category);
    }
    
    currentFilters.categories = selectedCategories;
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
    
    // Apply filters
    filteredProducts = products.filter(p => {
        const categoryMatch = selectedCategories.includes(p.category);
        const priceMatch = p.price >= minPrice && p.price <= maxPrice;
        return categoryMatch && priceMatch;
    });
    
    // Apply current sort
    sortProducts();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sort-select')?.value || 'featured';
    currentFilters.sortBy = sortBy;
    
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Featured - original order
            filteredProducts.sort((a, b) => a.id - b.id);
    }
    
    renderProducts();
    updateProductCount();
}

// Clear all filters
function clearFilters() {
    // Reset checkboxes
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    
    // Reset price range
    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice) minPrice.value = 0;
    if (maxPrice) maxPrice.value = 500;
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';
    
    // Reset filters
    currentFilters = {
        categories: ['all'],
        minPrice: 0,
        maxPrice: 500,
        sortBy: 'featured'
    };
    
    filteredProducts = [...products];
    renderProducts();
    updateProductCount();
}

// Update product count
function updateProductCount() {
    const countEl = document.getElementById('product-count');
    if (countEl) {
        countEl.textContent = filteredProducts.length;
    }
}

// Toggle mobile filters
function toggleMobileFilters() {
    const sidebar = document.querySelector('.filters-sidebar');
    if (!sidebar) return;
    
    sidebar.classList.toggle('mobile-active');
    
    // Add backdrop
    if (sidebar.classList.contains('mobile-active')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'filter-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 998;
        `;
        backdrop.onclick = () => {
            sidebar.classList.remove('mobile-active');
            backdrop.remove();
        };
        document.body.appendChild(backdrop);
    } else {
        const backdrop = document.querySelector('.filter-backdrop');
        if (backdrop) backdrop.remove();
    }
}

// Add styles for products page
const productsStyles = document.createElement('style');
productsStyles.textContent = `
    /* Products Page Styles */
    .products-page {
        padding-top: 0;
    }
    
    .page-header {
        background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
        padding: 60px 0 40px;
        text-align: center;
        border-bottom: 1px solid #eee;
    }
    
    .page-header h1 {
        font-size: 3rem;
        margin-bottom: 10px;
    }
    
    .page-header p {
        color: #666;
        font-size: 1.1rem;
    }
    
    .products-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 40px;
        margin-top: 40px;
    }
    
    /* Filters */
    .filters-sidebar {
        position: sticky;
        top: 100px;
        height: fit-content;
        background: #fafafa;
        padding: 25px;
        border-radius: 10px;
    }
    
    .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ddd;
    }
    
    .filter-header h3 {
        font-size: 1.2rem;
        font-weight: 600;
    }
    
    .btn-text {
        background: none;
        border: none;
        color: var(--gold-primary);
        font-weight: 600;
        cursor: pointer;
        font-size: 0.85rem;
    }
    
    .filter-group {
        margin-bottom: 30px;
    }
    
    .filter-group h4 {
        font-size: 0.95rem;
        margin-bottom: 15px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .filter-option {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .filter-option input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }
    
    .price-range {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .price-range input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    
    .filter-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background: white;
        cursor: pointer;
    }
    
    /* Products Grid */
    .products-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }
    
    .results-count {
        font-weight: 600;
        color: #666;
    }
    
    .mobile-filter-toggle {
        display: none;
        padding: 10px 20px;
        background: var(--gold-primary);
        color: white;
        border: none;
        border-radius: 5px;
        font-weight: 600;
        cursor: pointer;
    }
    
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 30px;
    }
    
    /* Quantity Controls */
    .qv-quantity {
        margin: 25px 0;
    }
    
    .qv-quantity label {
        display: block;
        margin-bottom: 10px;
        font-weight: 600;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .quantity-controls input {
        width: 60px;
        text-align: center;
        padding: 8px;
        border: 2px solid #ddd;
        border-radius: 5px;
        font-weight: 600;
        font-size: 1rem;
    }
    
    /* Mobile Responsive */
    @media (max-width: 1024px) {
        .products-layout {
            grid-template-columns: 1fr;
        }
        
        .filters-sidebar {
            position: fixed;
            left: -100%;
            top: 0;
            height: 100vh;
            width: 300px;
            z-index: 999;
            background: white;
            transition: left 0.3s ease;
            overflow-y: auto;
        }
        
        .filters-sidebar.mobile-active {
            left: 0;
        }
        
        .mobile-filter-toggle {
            display: block;
        }
        
        .page-header h1 {
            font-size: 2rem;
        }
        
        .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        }
    }
    
    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .product-card {
            min-width: unset;
        }
    }
`;
document.head.appendChild(productsStyles);