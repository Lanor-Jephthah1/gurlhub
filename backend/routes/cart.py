"""
GIRLHUB BY DEBBS - CART ROUTES (routes/cart.py)
Shopping cart management endpoints (session-based)
"""

from flask import Blueprint, request, jsonify, session
from models import Product
from app import db

bp = Blueprint('cart', __name__, url_prefix='/api/cart')


# =========================================
# HELPER FUNCTIONS
# =========================================

def get_cart():
    """Get cart from session"""
    return session.get('cart', [])


def save_cart(cart):
    """Save cart to session"""
    session['cart'] = cart
    session.modified = True


def calculate_cart_total(cart):
    """Calculate total price of cart"""
    total = 0
    for item in cart:
        total += item.get('price', 0) * item.get('quantity', 1)
    return total


# =========================================
# GET CART
# =========================================

@bp.route('', methods=['GET'])
def get_cart_items():
    """Get current cart contents"""
    try:
        cart = get_cart()

        # Enrich cart with current product data
        enriched_cart = []
        for item in cart:
            product = Product.query.get(item['id'])
            if product and product.is_active:
                enriched_item = {
                    'id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'image': product.image,
                    'category': product.category,
                    'quantity': item['quantity'],
                    'stock': product.stock
                }
                enriched_cart.append(enriched_item)

        total = calculate_cart_total(enriched_cart)

        return jsonify({
            'cart': enriched_cart,
            'total': total,
            'item_count': sum(item['quantity'] for item in enriched_cart)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# ADD TO CART
# =========================================

@bp.route('/add', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)

        if not product_id:
            return jsonify({'error': 'Product ID required'}), 400

        if quantity < 1:
            return jsonify({'error': 'Quantity must be at least 1'}), 400

        # Check if product exists
        product = Product.query.get(product_id)
        if not product or not product.is_active:
            return jsonify({'error': 'Product not found'}), 404

        # Check stock
        cart = get_cart()
        existing_item = next((item for item in cart if item['id'] == product_id), None)

        if existing_item:
            new_quantity = existing_item['quantity'] + quantity
        else:
            new_quantity = quantity

        if product.stock < new_quantity:
            return jsonify({
                'error': f'Insufficient stock. Available: {product.stock}'
            }), 400

        # Add or update item in cart
        if existing_item:
            existing_item['quantity'] = new_quantity
            existing_item['price'] = product.price  # Update price in case it changed
        else:
            cart.append({
                'id': product_id,
                'quantity': quantity,
                'price': product.price
            })

        save_cart(cart)

        return jsonify({
            'message': 'Item added to cart',
            'cart': cart,
            'item_count': sum(item['quantity'] for item in cart)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# UPDATE CART ITEM
# =========================================

@bp.route('/update', methods=['PUT'])
def update_cart_item():
    """Update quantity of item in cart"""
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity')

        if not product_id or quantity is None:
            return jsonify({'error': 'Product ID and quantity required'}), 400

        if quantity < 0:
            return jsonify({'error': 'Quantity cannot be negative'}), 400

        cart = get_cart()
        item = next((item for item in cart if item['id'] == product_id), None)

        if not item:
            return jsonify({'error': 'Item not in cart'}), 404

        if quantity == 0:
            # Remove item if quantity is 0
            cart = [i for i in cart if i['id'] != product_id]
        else:
            # Check stock
            product = Product.query.get(product_id)
            if product and product.stock < quantity:
                return jsonify({
                    'error': f'Insufficient stock. Available: {product.stock}'
                }), 400

            item['quantity'] = quantity
            if product:
                item['price'] = product.price  # Update price

        save_cart(cart)

        return jsonify({
            'message': 'Cart updated',
            'cart': cart,
            'item_count': sum(item['quantity'] for item in cart)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# REMOVE FROM CART
# =========================================

@bp.route('/remove/<int:product_id>', methods=['DELETE'])
def remove_from_cart(product_id):
    """Remove item from cart"""
    try:
        cart = get_cart()
        original_length = len(cart)

        cart = [item for item in cart if item['id'] != product_id]

        if len(cart) == original_length:
            return jsonify({'error': 'Item not in cart'}), 404

        save_cart(cart)

        return jsonify({
            'message': 'Item removed from cart',
            'cart': cart,
            'item_count': sum(item['quantity'] for item in cart)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# CLEAR CART
# =========================================

@bp.route('/clear', methods=['DELETE'])
def clear_cart():
    """Clear entire cart"""
    try:
        session['cart'] = []
        session.modified = True

        return jsonify({
            'message': 'Cart cleared',
            'cart': [],
            'item_count': 0
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET CART COUNT
# =========================================

@bp.route('/count', methods=['GET'])
def get_cart_count():
    """Get total number of items in cart"""
    try:
        cart = get_cart()
        count = sum(item['quantity'] for item in cart)

        return jsonify({'count': count}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# VALIDATE CART
# =========================================

@bp.route('/validate', methods=['POST'])
def validate_cart():
    """Validate cart items and stock availability"""
    try:
        cart = get_cart()
        issues = []
        valid_items = []

        for item in cart:
            product = Product.query.get(item['id'])

            if not product or not product.is_active:
                issues.append({
                    'product_id': item['id'],
                    'issue': 'Product no longer available'
                })
                continue

            if product.stock < item['quantity']:
                issues.append({
                    'product_id': item['id'],
                    'product_name': product.name,
                    'issue': f'Insufficient stock. Available: {product.stock}, Requested: {item["quantity"]}'
                })
                # Adjust quantity to available stock
                item['quantity'] = product.stock

            if product.price != item['price']:
                issues.append({
                    'product_id': item['id'],
                    'product_name': product.name,
                    'issue': f'Price changed from {item["price"]} to {product.price}'
                })
                # Update to current price
                item['price'] = product.price

            valid_items.append(item)

        # Save updated cart
        save_cart(valid_items)

        return jsonify({
            'valid': len(issues) == 0,
            'issues': issues,
            'cart': valid_items
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500