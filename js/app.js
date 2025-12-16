/**
 * GIRLHUB BY DEBBS - MAIN APPLICATION
 * Complete E-Commerce Functionality
 */

// =========================================
// 1. GLOBAL STATE & CONFIGURATION
// =========================================

const state = {
    currency: { code: 'GH', symbol: '₵', rate: 1 },
    cart: [],
    wishlist: [],
    user: null,
    currentProductForModal: null
};

const exchangeRates = {
    'GH': { symbol: '₵', rate: 1 },
    'NG': { symbol: '₦', rate: 105 },
    'UK': { symbol: '£', rate: 0.05 },
    'US': { symbol: '$', rate: 0.06 }
};

// EXPANDED PRODUCT DATABASE
const products = [
    { 
        id: 1, 
        name: "The 'Debbs' Gold Choker", 
        category: "Jewelry", 
        price: 150, 
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
        desc: "18k gold vermeil, water-resistant, and perfect for layering. A campus essential.",
        tags: ["gold", "necklace", "jewelry"]
    },
    { 
        id: 2, 
        name: "Vanilla Oud Essence", 
        category: "Fragrance", 
        price: 200, 
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
        desc: "A warm, spicy scent that lasts all day. Notes of vanilla, oud, and amber.",
        tags: ["perfume", "fragrance", "luxury"]
    },
    { 
        id: 3, 
        name: "The Uni Tote", 
        category: "Accessories", 
        price: 90, 
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        desc: "Canvas tote with reinforced straps. Fits a 15-inch laptop comfortably.",
        tags: ["bag", "tote", "university"]
    },
    { 
        id: 4, 
        name: "Aesthetic Tumbler", 
        category: "Lifestyle", 
        price: 85, 
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        desc: "Borosilicate glass with bamboo lid. Keeps your iced coffee cold for 6 hours.",
        tags: ["tumbler", "lifestyle", "aesthetic"]
    },
    { 
        id: 5, 
        name: "Pearl Drop Earrings", 
        category: "Jewelry", 
        price: 55, 
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
        desc: "Freshwater pearls on gold-plated hoops. Elegant yet understated.",
        tags: ["pearl", "earrings", "jewelry"]
    },
    { 
        id: 6, 
        name: "Digital Vision Planner", 
        category: "Digital", 
        price: 40, 
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop",
        desc: "iPad compatible PDF planner with hyperlinks. Get your life organized.",
        tags: ["planner", "digital", "productivity"]
    },
    { 
        id: 7, 
        name: "Rose Gold Bracelet Set", 
        category: "Jewelry", 
        price: 75, 
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
        desc: "Three delicate bracelets in rose gold. Stack them or wear individually.",
        tags: ["rose gold", "bracelet", "jewelry"]
    },
    { 
        id: 8, 
        name: "Laptop Sleeve - Velvet", 
        category: "Accessories", 
        price: 65, 
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
        desc: "Luxurious velvet sleeve for 13-15 inch laptops. Padded protection with style.",
        tags: ["laptop", "sleeve", "velvet"]
    },
    { 
        id: 9, 
        name: "Crystal Hoop Earrings", 
        category: "Jewelry", 
        price: 95, 
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
        desc: "Gold hoops with crystal embellishments. Perfect for special occasions.",
        tags: ["crystal", "hoops", "jewelry"]
    },
    { 
        id: 10, 
        name: "Mint Fresh Perfume", 
        category: "Fragrance", 
        price: 180, 
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
        desc: "Fresh and invigorating scent with notes of mint, citrus, and white tea.",
        tags: ["perfume", "fresh", "fragrance"]
    },
    { 
        id: 11, 
        name: "Study Essentials Bundle", 
        category: "Digital", 
        price: 55, 
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop",
        desc: "Complete digital study kit with planner, note templates, and wallpapers.",
        tags: ["bundle", "digital", "study"]
    },
    { 
        id: 12, 
        name: "Metallic Water Bottle", 
        category: "Lifestyle", 
        price: 50, 
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        desc: "Stainless steel insulated bottle. Keeps drinks hot or cold for 24 hours.",
        tags: ["bottle", "lifestyle", "hydration"]
    }
];

// =========================================
// 2. INITIALIZATION
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initEntryModal();
    initMobileMenu();
    initSearch();
    initCart();
    initQuickView();
    initBundleBuilder();
    loadUserData();
    updateCurrencyDisplay();
    
    // Load products on homepage
    if (document.getElementById('home-products')) {
        loadHomeProducts();
    }
});

// =========================================
// 3. PAGE TRANSITIONS
// =========================================

function navigateTo(event, url, filter = null) {
    if (event) event.preventDefault();
    
    const transition = document.getElementById('page-transition');
    if (!transition) {
        // No transition element, navigate directly
        if (filter) {
            sessionStorage.setItem('productFilter', filter);
        }
        window.location.href = url;
        return;
    }
    
    transition.classList.add('active');
    
    setTimeout(() => {
        if (filter) {
            sessionStorage.setItem('productFilter', filter);
        }
        window.location.href = url;
    }, 500);
}

// =========================================
// 4. PRELOADER
// =========================================

function initPreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.remove('loading');
        }, 1500);
    });
}

// =========================================
// 5. ENTRY MODAL & CURRENCY
// =========================================

function initEntryModal() {
    const modal = document.getElementById('entry-modal');
    if (!modal) return;
    
    const form = document.getElementById('preference-form');
    const closeBtn = modal.querySelector('.close-modal');
    const select = document.getElementById('shipping-loc');
    const hasVisited = localStorage.getItem('girlhub_visited');

    if (!hasVisited) {
        setTimeout(() => {
            modal.classList.add('open');
            document.body.classList.add('no-scroll');
        }, 2500);
    } else {
        const savedCurrency = JSON.parse(localStorage.getItem('girlhub_currency'));
        if (savedCurrency) {
            setCurrency(savedCurrency.code);
        }
    }

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
        localStorage.setItem('girlhub_visited', 'true');
    };

    closeBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = select.value;
        setCurrency(code);
        showNotification("Welcome to the club! 10% Discount Applied.");
        closeModal();
    });
}

function setCurrency(code) {
    if (exchangeRates[code]) {
        state.currency = { code, ...exchangeRates[code] };
        localStorage.setItem('girlhub_currency', JSON.stringify(state.currency));
        updateAllPrices();
        updateCurrencyDisplay();
    }
}

function formatPrice(amount) {
    const val = (amount * state.currency.rate).toFixed(2);
    return `${state.currency.symbol}${val}`;
}

function updateAllPrices() {
    const priceEls = document.querySelectorAll('.price');
    priceEls.forEach(el => {
        const priceText = el.dataset.price;
        if (priceText) {
            el.textContent = formatPrice(parseFloat(priceText));
        }
    });
    renderCart();
}

function updateCurrencyDisplay() {
    const display = document.querySelector('.currency-display');
    if (display) display.textContent = `${state.currency.code} ${state.currency.symbol}`;
}

// =========================================
// 6. MOBILE MENU
// =========================================

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.desktop-nav');
    const dropdownTrigger = document.querySelector('.has-dropdown > a');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdownTrigger.parentElement.classList.toggle('active');
            }
        });
    }
}

// =========================================
// 7. SEARCH FUNCTIONALITY
// =========================================

function initSearch() {
    const triggers = document.querySelectorAll('.search-trigger');
    const overlay = document.getElementById('search-overlay');
    const closeBtn = overlay?.querySelector('.close-overlay');
    const input = overlay?.querySelector('#search-input');
    const wrapper = overlay?.querySelector('.search-wrapper');

    if (!overlay) return;

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results-list';
    resultsDiv.style.cssText = "margin-top: 20px; text-align: left; max-height: 50vh; overflow-y: auto;";
    wrapper.appendChild(resultsDiv);

    triggers.forEach(btn => btn.addEventListener('click', () => {
        overlay.classList.add('open');
        input.focus();
    }));

    closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));

    input?.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        resultsDiv.innerHTML = '';

        if (term.length < 2) return;

        const matches = products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term) ||
            p.tags.some(tag => tag.includes(term))
        );

        if (matches.length === 0) {
            resultsDiv.innerHTML = '<p style="color:#666; margin-top:10px;">No matches found, queen.</p>';
        } else {
            matches.forEach(p => {
                const item = document.createElement('div');
                item.style.cssText = "display: flex; gap: 15px; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;";
                item.innerHTML = `
                    <img src="${p.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    <div>
                        <div style="font-weight: 600;">${p.name}</div>
                        <div style="color: #D4AF37;">${formatPrice(p.price)}</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    openQuickView(p.id);
                    overlay.classList.remove('open');
                    input.value = '';
                    resultsDiv.innerHTML = '';
                });
                resultsDiv.appendChild(item);
            });
        }
    });

    // Quick links
    document.querySelectorAll('.quick-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const searchTerm = link.dataset.search;
            input.value = searchTerm;
            input.dispatchEvent(new KeyboardEvent('keyup'));
        });
    });
}

// =========================================
// 8. CART FUNCTIONALITY
// =========================================

function initCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const triggers = document.querySelectorAll('.cart-trigger');
    const closeBtn = sidebar?.querySelector('.close-sidebar');

    if (!sidebar) return;

    triggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    }));

    closeBtn?.addEventListener('click', closeCart);
    
    loadCart();
}

function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.add('open');
    
    if (!document.querySelector('.cart-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'cart-backdrop';
        backdrop.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000;";
        backdrop.onclick = closeCart;
        document.body.appendChild(backdrop);
    }
}

function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.remove('open');
    const backdrop = document.querySelector('.cart-backdrop');
    if (backdrop) backdrop.remove();
}

function addToCart(productId, quantity = 1) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        showNotification("Please sign in to add items to cart");
        setTimeout(() => navigateTo(null, 'auth.html'), 1500);
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if item already exists in cart
    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        state.cart.push({ ...product, quantity });
    }

    saveCart();
    renderCart();
    showNotification(`Added ${product.name} to bag`);
    openCart();
}

function updateCartQuantity(productId, change) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
    }
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showNotification("Item removed from bag");
}

function renderCart() {
    const container = document.querySelector('.cart-items-container');
    const badge = document.querySelector('.badge');
    const countSpan = document.querySelector('.cart-count');
    const totalEl = document.querySelector('.cart-total-price');

    if (!container) return;

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    countSpan.textContent = totalItems;

    let total = 0;
    state.cart.forEach(item => total += item.price * item.quantity);
    totalEl.textContent = formatPrice(total);

    container.innerHTML = '';
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; margin-top: 50px; color: #999;">
                <i class="far fa-sad-tear" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Your bag is empty, bestie!</p>
            </div>
        `;
        return;
    }

    state.cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.cssText = "margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;";
        div.innerHTML = `
            <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                <img src="${item.image}" style="width: 70px; height: 80px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin-bottom: 5px;">${item.name}</h4>
                    <div style="color: #666; font-size: 0.85rem;">${formatPrice(item.price)}</div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="quantity-controls" style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateCartQuantity(${item.id}, -1)" class="qty-btn">-</button>
                    <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, 1)" class="qty-btn">+</button>
                </div>
                <button onclick="removeFromCart(${item.id})" style="color: #999; text-decoration: underline; font-size: 0.8rem; background: none; border: none; cursor: pointer;">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function saveCart() {
    localStorage.setItem('girlhub_cart', JSON.stringify(state.cart));
}

function loadCart() {
    const saved = localStorage.getItem('girlhub_cart');
    if (saved) {
        state.cart = JSON.parse(saved);
        renderCart();
    }
}

function proceedToCheckout() {
    if (!isLoggedIn()) {
        showNotification("Please sign in to checkout");
        setTimeout(() => navigateTo(null, 'auth.html'), 1500);
        return;
    }
    
    if (state.cart.length === 0) {
        showNotification("Your cart is empty!");
        return;
    }
    
    showNotification("Proceeding to checkout...");
    // Here you would navigate to checkout page
}

// =========================================
// 9. QUICK VIEW MODAL
// =========================================

function initQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-modal-qv');
    closeBtn.addEventListener('click', closeQuickView);
}

function openQuickView(productId) {
    const modal = document.getElementById('quick-view-modal');
    const p = products.find(x => x.id === productId);
    if (!p) return;

    state.currentProductForModal = p;

    modal.querySelector('img').src = p.image;
    modal.querySelector('.qv-cat').textContent = p.category;
    modal.querySelector('.qv-title').textContent = p.name;
    modal.querySelector('.qv-desc').textContent = p.desc;
    modal.querySelector('.qv-price').textContent = formatPrice(p.price);
    
    const qtyInput = document.getElementById('modal-qty');
    if (qtyInput) qtyInput.value = 1;

    const addBtn = modal.querySelector('.qv-add');
    addBtn.onclick = () => {
        const qty = parseInt(document.getElementById('modal-qty')?.value || 1);
        addToCart(p.id, qty);
        closeQuickView();
    };

    modal.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function updateModalQty(change) {
    const input = document.getElementById('modal-qty');
    if (!input) return;
    
    let val = parseInt(input.value) + change;
    if (val < 1) val = 1;
    input.value = val;
}

// =========================================
// 10. BUNDLE BUILDER
// =========================================

function initBundleBuilder() {
    const steps = document.querySelectorAll('.bundle-steps .step');
    const images = document.querySelectorAll('.collage-img');
    const startBtn = document.querySelector('.bundle-section .btn-black');

    if (!startBtn) return;

    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            steps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');
            images.forEach(img => img.style.opacity = '0.5');
            if (images[index]) images[index].style.opacity = '1';
        });
    });

    startBtn.addEventListener('click', () => {
        showNotification("Launching Bundle Configurator...");
    });
}

// =========================================
// 11. USER AUTHENTICATION
// =========================================

function isLoggedIn() {
    return state.user !== null || localStorage.getItem('girlhub_user') !== null;
}

function loadUserData() {
    const userData = localStorage.getItem('girlhub_user');
    if (userData) {
        state.user = JSON.parse(userData);
        updateAccountButton();
    }
}

function updateAccountButton() {
    const accountBtn = document.querySelector('.account-btn');
    if (!accountBtn) return;

    if (isLoggedIn()) {
        accountBtn.innerHTML = '<i class="fas fa-user"></i>';
        accountBtn.title = state.user?.name || 'Account';
    // window.location.href = 'profile.html';
    }
}

// Handle account button click
function handleAccountClick() {
    if (isLoggedIn()) {
        // User is logged in, go to profile
        window.location.href = 'profile.html';
    } else {
        // User not logged in, go to auth
        window.location.href = 'auth.html';
    }
}

// =========================================
// 12. HOME PRODUCTS LOADER
// =========================================

function loadHomeProducts() {
    const container = document.getElementById('home-products');
    if (!container) return;

    // Load first 4 products
    products.slice(0, 4).forEach(p => {
        const card = createProductCard(p);
        container.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const isNew = product.id <= 3;
    const isSale = product.id === 3;
    
    card.innerHTML = `
        <div class="product-image">
            ${isNew ? '<span class="tag">Hot</span>' : ''}
            ${isSale ? '<span class="tag sale">Sale</span>' : ''}
            <img src="${product.image}" alt="${product.name}">
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

// =========================================
// 13. UTILITIES
// =========================================

function showNotification(msg) {
    const note = document.createElement('div');
    note.textContent = msg;
    note.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #111; color: #fff; padding: 12px 25px; border-radius: 8px;
        font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;
        z-index: 10000; animation: fadeUp 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(note);

    setTimeout(() => {
        note.style.opacity = '0';
        note.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => note.remove(), 300);
    }, 3000);
}

// Animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes fadeUp { 
        from { opacity: 0; transform: translate(-50%, 20px); } 
        to { opacity: 1; transform: translate(-50%, 0); } 
    }
    @keyframes fadeIn { 
        from { opacity: 0; } 
        to { opacity: 1; } 
    }
    @keyframes fadeInUp { 
        from { opacity: 0; transform: translateY(30px); } 
        to { opacity: 1; transform: translateY(0); } 
    }
    
    .qty-btn {
        width: 30px; height: 30px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    .qty-btn:hover {
        background: var(--gold-primary);
        border-color: var(--gold-primary);
        color: white;
    }
`;
document.head.appendChild(styleSheet);