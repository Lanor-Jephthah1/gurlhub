"""
GIRLHUB BY DEBBS - FLASK APPLICATION (app.py)
Main Flask application configuration and initialization
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
import secrets
import os

# Initialize Flask app
app = Flask(__name__)

# =========================================
# APP CONFIGURATION
# =========================================

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///girlhub.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['JSON_SORT_KEYS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, supports_credentials=True, origins=['http://localhost:*', 'http://127.0.0.1:*', 'https://*.github.io'])

# Import models and routes after db initialization
from models import User, Product, Order, OrderItem, Address, WishlistItem
from routes import auth, products, orders, users, cart

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(products.bp)
app.register_blueprint(orders.bp)
app.register_blueprint(users.bp)
app.register_blueprint(cart.bp)


# =========================================
# DATABASE INITIALIZATION
# =========================================

@app.before_first_request
def create_tables():
    """Create database tables and seed initial data"""
    db.create_all()
    seed_products()


def seed_products():
    """Seed initial products if database is empty"""
    if Product.query.count() == 0:
        products_data = [
            {
                'name': "The 'Debbs' Gold Choker",
                'category': 'Jewelry',
                'price': 150,
                'image': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop',
                'description': '18k gold vermeil, water-resistant, and perfect for layering. A campus essential.',
                'tags': 'gold,necklace,jewelry',
                'stock': 50
            },
            {
                'name': 'Vanilla Oud Essence',
                'category': 'Fragrance',
                'price': 200,
                'image': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop',
                'description': 'A warm, spicy scent that lasts all day. Notes of vanilla, oud, and amber.',
                'tags': 'perfume,fragrance,luxury',
                'stock': 30
            },
            {
                'name': 'The Uni Tote',
                'category': 'Accessories',
                'price': 90,
                'image': 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
                'description': 'Canvas tote with reinforced straps. Fits a 15-inch laptop comfortably.',
                'tags': 'bag,tote,university',
                'stock': 75
            },
            {
                'name': 'Aesthetic Tumbler',
                'category': 'Lifestyle',
                'price': 85,
                'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
                'description': 'Borosilicate glass with bamboo lid. Keeps your iced coffee cold for 6 hours.',
                'tags': 'tumbler,lifestyle,aesthetic',
                'stock': 100
            },
            {
                'name': 'Pearl Drop Earrings',
                'category': 'Jewelry',
                'price': 55,
                'image': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
                'description': 'Freshwater pearls on gold-plated hoops. Elegant yet understated.',
                'tags': 'pearl,earrings,jewelry',
                'stock': 60
            },
            {
                'name': 'Digital Vision Planner',
                'category': 'Digital',
                'price': 40,
                'image': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop',
                'description': 'iPad compatible PDF planner with hyperlinks. Get your life organized.',
                'tags': 'planner,digital,productivity',
                'stock': 999
            },
            {
                'name': 'Rose Gold Bracelet Set',
                'category': 'Jewelry',
                'price': 75,
                'image': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop',
                'description': 'Three delicate bracelets in rose gold. Stack them or wear individually.',
                'tags': 'rose gold,bracelet,jewelry',
                'stock': 45
            },
            {
                'name': 'Laptop Sleeve - Velvet',
                'category': 'Accessories',
                'price': 65,
                'image': 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
                'description': 'Luxurious velvet sleeve for 13-15 inch laptops. Padded protection with style.',
                'tags': 'laptop,sleeve,velvet',
                'stock': 55
            },
            {
                'name': 'Crystal Hoop Earrings',
                'category': 'Jewelry',
                'price': 95,
                'image': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
                'description': 'Gold hoops with crystal embellishments. Perfect for special occasions.',
                'tags': 'crystal,hoops,jewelry',
                'stock': 40
            },
            {
                'name': 'Mint Fresh Perfume',
                'category': 'Fragrance',
                'price': 180,
                'image': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop',
                'description': 'Fresh and invigorating scent with notes of mint, citrus, and white tea.',
                'tags': 'perfume,fresh,fragrance',
                'stock': 35
            },
            {
                'name': 'Study Essentials Bundle',
                'category': 'Digital',
                'price': 55,
                'image': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop',
                'description': 'Complete digital study kit with planner, note templates, and wallpapers.',
                'tags': 'bundle,digital,study',
                'stock': 999
            },
            {
                'name': 'Metallic Water Bottle',
                'category': 'Lifestyle',
                'price': 50,
                'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
                'description': 'Stainless steel insulated bottle. Keeps drinks hot or cold for 24 hours.',
                'tags': 'bottle,lifestyle,hydration',
                'stock': 80
            }
        ]

        for product_data in products_data:
            product = Product(**product_data)
            db.session.add(product)

        db.session.commit()
        print('✅ Database seeded with products')


# =========================================
# ROOT ROUTE
# =========================================

@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'message': 'Girlhub by Debbs API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth',
            'products': '/api/products',
            'orders': '/api/orders',
            'users': '/api/users',
            'cart': '/api/cart'
        }
    })


@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})


# =========================================
# ERROR HANDLERS
# =========================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


# =========================================
# RUN APPLICATION
# =========================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)