"""
GIRLHUB BY DEBBS - DATABASE MODELS (models.py)
SQLAlchemy database models
"""

from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


# =========================================
# USER MODEL
# =========================================

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    birthday = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True, cascade='all, delete-orphan')
    addresses = db.relationship('Address', backref='user', lazy=True, cascade='all, delete-orphan')
    wishlist_items = db.relationship('WishlistItem', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set user password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'birthday': self.birthday.isoformat() if self.birthday else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        return data

    def __repr__(self):
        return f'<User {self.email}>'


# =========================================
# PRODUCT MODEL
# =========================================

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(500))
    description = db.Column(db.Text)
    tags = db.Column(db.String(500))  # Comma-separated tags
    stock = db.Column(db.Integer, default=100)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert product to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'image': self.image,
            'desc': self.description,
            'tags': self.tags.split(',') if self.tags else [],
            'stock': self.stock,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f'<Product {self.name}>'


# =========================================
# ORDER MODEL
# =========================================

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    status = db.Column(db.String(50), default='pending')  # pending, processing, shipped, delivered, cancelled
    total_amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='GHS')
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'))
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(50), default='pending')
    tracking_number = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    shipping_address = db.relationship('Address', foreign_keys=[shipping_address_id])

    def to_dict(self, include_items=True):
        """Convert order to dictionary"""
        data = {
            'id': self.id,
            'order_number': self.order_number,
            'status': self.status,
            'total_amount': self.total_amount,
            'currency': self.currency,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'tracking_number': self.tracking_number,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

        if include_items:
            data['items'] = [item.to_dict() for item in self.items]

        if self.shipping_address:
            data['shipping_address'] = self.shipping_address.to_dict()

        return data

    def __repr__(self):
        return f'<Order {self.order_number}>'


# =========================================
# ORDER ITEM MODEL
# =========================================

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    # Relationship
    product = db.relationship('Product', backref='order_items')

    def to_dict(self):
        """Convert order item to dictionary"""
        return {
            'id': self.id,
            'product': self.product.to_dict() if self.product else None,
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': self.quantity * self.price
        }

    def __repr__(self):
        return f'<OrderItem {self.id}>'


# =========================================
# ADDRESS MODEL
# =========================================

class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    label = db.Column(db.String(50))  # Home, Office, etc.
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    street = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(50), default='Ghana')
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert address to dictionary"""
        return {
            'id': self.id,
            'label': self.label,
            'name': self.name,
            'phone': self.phone,
            'street': self.street,
            'city': self.city,
            'region': self.region,
            'postal_code': self.postal_code,
            'country': self.country,
            'is_default': self.is_default
        }

    def __repr__(self):
        return f'<Address {self.label or self.id}>'


# =========================================
# WISHLIST ITEM MODEL
# =========================================

class WishlistItem(db.Model):
    __tablename__ = 'wishlist_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    product = db.relationship('Product', backref='wishlist_items')

    # Unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'product_id', name='unique_user_product'),)

    def to_dict(self):
        """Convert wishlist item to dictionary"""
        return {
            'id': self.id,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<WishlistItem {self.id}>'