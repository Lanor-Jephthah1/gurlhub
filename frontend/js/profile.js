/**
 * PROFILE PAGE LOGIC
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadProfileData();
    loadSettings();
});

// Check if user is authenticated
function checkAuthentication() {
    const user = localStorage.getItem('girlhub_user');
    if (!user) {
        // Not logged in, redirect to auth page
        window.location.href = 'auth.html';
        return;
    }
}

// Load user profile data
function loadProfileData() {
    const userData = JSON.parse(localStorage.getItem('girlhub_user'));
    if (!userData) return;

    // Update display elements
    document.getElementById('user-name-display').textContent = userData.name;
    document.getElementById('user-email-display').textContent = userData.email;
    document.getElementById('welcome-text').textContent = `Welcome back, ${userData.name.split(' ')[0]}!`;

    // Load form fields
    document.getElementById('profile-name').value = userData.name || '';
    document.getElementById('profile-email').value = userData.email || '';
    document.getElementById('profile-phone').value = userData.phone || '';
    document.getElementById('profile-birthday').value = userData.birthday || '';
}

// Switch between profile tabs
function showProfileTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all nav items
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active to clicked nav item
    event.target.closest('.profile-nav-item').classList.add('active');
}

// Update profile information
function updateProfile(event) {
    event.preventDefault();

    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    const birthday = document.getElementById('profile-birthday').value;

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem('girlhub_user'));

    // Update user data
    const updatedUser = {
        ...currentUser,
        name,
        email,
        phone,
        birthday,
        updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('girlhub_user', JSON.stringify(updatedUser));

    // Update users array
    const users = JSON.parse(localStorage.getItem('girlhub_users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name, email, phone, birthday };
        localStorage.setItem('girlhub_users', JSON.stringify(users));
    }

    // Update display
    loadProfileData();
    
    showNotification('Profile updated successfully!');
}

// Change password
function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    // Validate
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters');
        return;
    }

    // Verify current password
    const users = JSON.parse(localStorage.getItem('girlhub_users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('girlhub_user'));
    const user = users.find(u => u.email === currentUser.email);

    if (!user || user.password !== currentPassword) {
        showNotification('Current password is incorrect');
        return;
    }

    // Update password
    user.password = newPassword;
    localStorage.setItem('girlhub_users', JSON.stringify(users));

    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';

    showNotification('Password changed successfully!');
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('girlhub_user');
        localStorage.removeItem('girlhub_remember');
        showNotification('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Delete account
function deleteAccount() {
    const confirmed = confirm(
        'Are you absolutely sure you want to delete your account? This action cannot be undone.\n\nAll your data, orders, and wishlist will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    
    if (doubleConfirm !== 'DELETE') {
        showNotification('Account deletion cancelled');
        return;
    }

    // Remove user from users array
    const users = JSON.parse(localStorage.getItem('girlhub_users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('girlhub_user'));
    const filteredUsers = users.filter(u => u.email !== currentUser.email);
    
    localStorage.setItem('girlhub_users', JSON.stringify(filteredUsers));
    localStorage.removeItem('girlhub_user');
    localStorage.removeItem('girlhub_cart');
    localStorage.removeItem('girlhub_remember');

    showNotification('Account deleted successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Show add address form
function showAddAddressForm() {
    const container = document.getElementById('addresses-container');
    
    const formHTML = `
        <div class="profile-card" style="animation: fadeInUp 0.4s;">
            <h3>Add New Address</h3>
            <form onsubmit="saveAddress(event)">
                <div class="form-group">
                    <label>Address Label</label>
                    <input type="text" id="address-label" placeholder="Home, Office, etc." required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="address-name" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="address-phone" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Street Address</label>
                    <input type="text" id="address-street" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="address-city" required>
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <input type="text" id="address-region" required>
                    </div>
                </div>
                <div class="form-row">
                    <button type="submit" class="btn btn-gold">Save Address</button>
                    <button type="button" class="btn btn-black" onclick="loadAddresses()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    container.innerHTML = formHTML;
}

// Save address
function saveAddress(event) {
    event.preventDefault();

    const address = {
        id: Date.now(),
        label: document.getElementById('address-label').value,
        name: document.getElementById('address-name').value,
        phone: document.getElementById('address-phone').value,
        street: document.getElementById('address-street').value,
        city: document.getElementById('address-city').value,
        region: document.getElementById('address-region').value,
        isDefault: false
    };

    // Get current addresses
    const addresses = JSON.parse(localStorage.getItem('girlhub_addresses') || '[]');
    
    // If this is the first address, make it default
    if (addresses.length === 0) {
        address.isDefault = true;
    }

    addresses.push(address);
    localStorage.setItem('girlhub_addresses', JSON.stringify(addresses));

    showNotification('Address added successfully!');
    loadAddresses();
}

// Load saved addresses
function loadAddresses() {
    const container = document.getElementById('addresses-container');
    const addresses = JSON.parse(localStorage.getItem('girlhub_addresses') || '[]');

    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="empty-state-profile">
                <i class="fas fa-map-marker-alt"></i>
                <h3>No Saved Addresses</h3>
                <p>Add your delivery addresses for faster checkout</p>
            </div>
        `;
        return;
    }

    container.innerHTML = addresses.map(addr => `
        <div class="address-card">
            <div class="address-header">
                <h4>${addr.label} ${addr.isDefault ? '<span class="badge-default">Default</span>' : ''}</h4>
                <div class="address-actions">
                    <button onclick="editAddress(${addr.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteAddress(${addr.id})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="address-details">
                <p><strong>${addr.name}</strong></p>
                <p>${addr.phone}</p>
                <p>${addr.street}</p>
                <p>${addr.city}, ${addr.region}</p>
            </div>
            ${!addr.isDefault ? `<button class="btn-text" onclick="setDefaultAddress(${addr.id})">Set as Default</button>` : ''}
        </div>
    `).join('');
}

// Set default address
function setDefaultAddress(id) {
    const addresses = JSON.parse(localStorage.getItem('girlhub_addresses') || '[]');
    addresses.forEach(addr => {
        addr.isDefault = addr.id === id;
    });
    localStorage.setItem('girlhub_addresses', JSON.stringify(addresses));
    showNotification('Default address updated');
    loadAddresses();
}

// Delete address
function deleteAddress(id) {
    if (confirm('Delete this address?')) {
        let addresses = JSON.parse(localStorage.getItem('girlhub_addresses') || '[]');
        addresses = addresses.filter(addr => addr.id !== id);
        localStorage.setItem('girlhub_addresses', JSON.stringify(addresses));
        showNotification('Address deleted');
        loadAddresses();
    }
}

// Load settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('girlhub_settings') || '{}');
    
    document.getElementById('email-notifications').checked = settings.emailNotifications !== false;
    document.getElementById('promo-emails').checked = settings.promoEmails !== false;
    document.getElementById('order-updates').checked = settings.orderUpdates !== false;
    document.getElementById('save-history').checked = settings.saveHistory || false;
    document.getElementById('personalized-recs').checked = settings.personalizedRecs !== false;

    // Save on change
    document.querySelectorAll('.toggle-setting input').forEach(input => {
        input.addEventListener('change', saveSettings);
    });
}

// Save settings
function saveSettings() {
    const settings = {
        emailNotifications: document.getElementById('email-notifications').checked,
        promoEmails: document.getElementById('promo-emails').checked,
        orderUpdates: document.getElementById('order-updates').checked,
        saveHistory: document.getElementById('save-history').checked,
        personalizedRecs: document.getElementById('personalized-recs').checked
    };

    localStorage.setItem('girlhub_settings', JSON.stringify(settings));
    showNotification('Settings saved');
}

// Add profile page styles
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .profile-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 40px;
        margin-top: 40px;
    }

    .profile-sidebar {
        position: sticky;
        top: 100px;
        height: fit-content;
    }

    .profile-avatar {
        text-align: center;
        padding: 30px 20px;
        background: #fafafa;
        border-radius: 15px;
        margin-bottom: 20px;
    }

    .avatar-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: var(--gold-gradient);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 15px;
    }

    .avatar-circle i {
        font-size: 3rem;
        color: white;
    }

    .profile-avatar h3 {
        margin-bottom: 5px;
        font-size: 1.2rem;
    }

    .profile-avatar p {
        color: #666;
        font-size: 0.9rem;
    }

    .profile-nav {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .profile-nav-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 20px;
        background: white;
        border: 2px solid transparent;
        border-radius: 10px;
        text-align: left;
        font-weight: 500;
        transition: all 0.3s;
        cursor: pointer;
    }

    .profile-nav-item:hover {
        background: #fafafa;
        border-color: var(--gold-primary);
    }

    .profile-nav-item.active {
        background: var(--gold-primary);
        color: white;
    }

    .profile-nav-item i {
        font-size: 1.2rem;
        width: 20px;
    }

    .logout-btn {
        margin-top: 10px;
        color: #d63031;
    }

    .logout-btn:hover {
        background: #d63031 !important;
        color: white !important;
        border-color: #d63031 !important;
    }

    .profile-content {
        background: white;
        border-radius: 15px;
        padding: 40px;
    }

    .profile-tab {
        display: none;
    }

    .profile-tab.active {
        display: block;
        animation: fadeIn 0.4s;
    }

    .profile-card {
        background: #fafafa;
        padding: 30px;
        border-radius: 10px;
        margin-top: 20px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .empty-state-profile {
        text-align: center;
        padding: 60px 20px;
    }

    .empty-state-profile i {
        font-size: 4rem;
        color: #ddd;
        margin-bottom: 20px;
    }

    .empty-state-profile h3 {
        margin-bottom: 10px;
    }

    .empty-state-profile p {
        color: #666;
        margin-bottom: 20px;
    }

    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .toggle-setting {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 10px;
        border-radius: 5px;
        transition: background 0.2s;
    }

    .toggle-setting:hover {
        background: white;
    }

    .toggle-setting input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .btn-danger {
        background: #d63031;
        color: white;
        padding: 12px 30px;
        border-radius: 5px;
        font-weight: 600;
        transition: all 0.3s;
    }

    .btn-danger:hover {
        background: #a82020;
    }

    .address-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        border: 2px solid #eee;
    }

    .address-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .badge-default {
        background: var(--gold-primary);
        color: white;
        padding: 3px 10px;
        border-radius: 3px;
        font-size: 0.75rem;
        margin-left: 10px;
    }

    .address-actions {
        display: flex;
        gap: 10px;
    }

    .address-actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px 10px;
        color: #666;
        transition: color 0.2s;
    }

    .address-actions button:hover {
        color: var(--gold-primary);
    }

    .address-details p {
        margin-bottom: 5px;
        color: #666;
    }

    @media (max-width: 768px) {
        .profile-layout {
            grid-template-columns: 1fr;
        }

        .profile-sidebar {
            position: static;
        }

        .form-row {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(profileStyles);

// Initialize addresses on load
if (document.getElementById('addresses-tab')) {
    loadAddresses();
}