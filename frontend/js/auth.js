/**
 * AUTHENTICATION LOGIC
 */

// Switch between forms
function switchForm(event, formId) {
    event.preventDefault();
    
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show target form with animation
    const targetForm = document.getElementById(formId);
    setTimeout(() => {
        targetForm.classList.add('active');
    }, 100);
}

// Show forgot password form
function showForgotPassword(event) {
    event.preventDefault();
    switchForm(event, 'forgot-form');
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target.closest('.toggle-password').querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validate
    if (!email || !password) {
        showNotification('Please fill in all fields');
        return;
    }
    
    // Check credentials (in production, this would be an API call)
    const users = JSON.parse(localStorage.getItem('girlhub_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Success
        const userData = {
            name: user.name,
            email: user.email,
            loggedInAt: new Date().toISOString()
        };
        
        localStorage.setItem('girlhub_user', JSON.stringify(userData));
        
        if (rememberMe) {
            localStorage.setItem('girlhub_remember', 'true');
        }
        
        showSuccessAnimation();
        
        setTimeout(() => {
            navigateTo(null, 'index.html');
        }, 2000);
    } else {
        showNotification('Invalid email or password');
    }
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept the terms and conditions');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('Password must be at least 8 characters with 1 uppercase and 1 number');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('girlhub_users') || '[]');
    if (users.some(u => u.email === email)) {
        showNotification('An account with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('girlhub_users', JSON.stringify(users));
    
    // Auto login
    const userData = {
        name: newUser.name,
        email: newUser.email,
        loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('girlhub_user', JSON.stringify(userData));
    
    // Show success
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById('success-form').classList.add('active');
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    if (!email) {
        showNotification('Please enter your email address');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address');
        return;
    }
    
    // Check if email exists
    const users = JSON.parse(localStorage.getItem('girlhub_users') || '[]');
    if (!users.some(u => u.email === email)) {
        showNotification('No account found with this email');
        return;
    }
    
    // Show success message
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById('reset-sent-form').classList.add('active');
    
    // In production, send actual reset email
    console.log('Password reset email sent to:', email);
}

// Social login (placeholder)
function socialLogin(provider) {
    showNotification(`${provider} login is coming soon!`);
    // In production, implement OAuth flow
}

// Validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 number
    const re = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

// Success animation
function showSuccessAnimation() {
    showNotification('Login successful! Welcome back, Queen!');
}

// Show notification (uses the one from app.js if available)
if (typeof showNotification !== 'function') {
    function showNotification(msg) {
        const note = document.createElement('div');
        note.textContent = msg;
        note.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: #111; color: #fff; padding: 12px 25px; border-radius: 8px;
            font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;
            z-index: 10000; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(note);
        
        setTimeout(() => {
            note.style.opacity = '0';
            setTimeout(() => note.remove(), 300);
        }, 3000);
    }
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('girlhub_user');
    if (user && window.location.pathname.includes('auth.html')) {
        // Already logged in, redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
    }
});