"""
GIRLHUB BY DEBBS - ORDERS ROUTES (routes/orders.py)
Order management endpoints
"""

from flask import Blueprint, request, jsonify, session
from models import Order, OrderItem, Product, Address
from app import db
from datetime import datetime
import secrets

bp = Blueprint('orders', __name__, url_prefix='/api/orders')


# =========================================
# HELPER FUNCTIONS
# =========================================

def login_required(f):
    """Decorator to require authentication"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)

    return decorated_function


def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime('%Y%m%d')
    random_suffix = secrets.token_hex(4).upper()
    return f'GH-{timestamp}-{random_suffix}'


# =========================================
# CREATE ORDER
# =========================================

@bp.route('', methods=['POST'])
@login_required
def create_order():
    """Create a new order"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()

        # Validate required fields
        if not data.get('items') or len(data['items']) == 0:
            return jsonify({'error': 'Order must contain at least one item'}), 400

        # Calculate total and validate items
        total_amount = 0
        order_items = []

        for item in data['items']:
            product = Product.query.get(item['id'])

            if not product or not product.is_active:
                return jsonify({'error': f'Product {item["id"]} not found'}), 404

            quantity = item.get('quantity', 1)

            # Check stock
            if product.stock < quantity:
                return jsonify({
                    'error': f'Insufficient stock for {product.name}. Available: {product.stock}'
                }), 400

            item_total = product.price * quantity
            total_amount += item_total

            order_items.append({
                'product': product,
                'quantity': quantity,
                'price': product.price
            })

        # Create order
        order = Order(
            user_id=user_id,
            order_number=generate_order_number(),
            total_amount=total_amount,
            currency=data.get('currency', 'GHS'),
            shipping_address_id=data.get('shipping_address_id'),
            payment_method=data.get('payment_method'),
            notes=data.get('notes')
        )

        db.session.add(order)
        db.session.flush()  # Get order ID before adding items

        # Add order items and update stock
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product'].id,
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.session.add(order_item)

            # Reduce stock
            item_data['product'].stock -= item_data['quantity']

        db.session.commit()

        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# GET USER ORDERS
# =========================================

@bp.route('', methods=['GET'])
@login_required
def get_orders():
    """Get all orders for current user"""
    try:
        user_id = session.get('user_id')

        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()

        return jsonify({
            'orders': [order.to_dict() for order in orders],
            'count': len(orders)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET SINGLE ORDER
# =========================================

@bp.route('/<int:order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    """Get single order details"""
    try:
        user_id = session.get('user_id')

        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        return jsonify({'order': order.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET ORDER BY NUMBER
# =========================================

@bp.route('/track/<order_number>', methods=['GET'])
def track_order(order_number):
    """Track order by order number (no auth required)"""
    try:
        order = Order.query.filter_by(order_number=order_number).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Return limited information for public tracking
        return jsonify({
            'order_number': order.order_number,
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'tracking_number': order.tracking_number
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# UPDATE ORDER STATUS
# =========================================

@bp.route('/<int:order_id>/status', methods=['PATCH'])
@login_required
def update_order_status(order_id):
    """Update order status (for admin or cancellation)"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()

        new_status = data.get('status')

        if not new_status:
            return jsonify({'error': 'Status is required'}), 400

        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Only allow cancellation if order is pending
        if new_status == 'cancelled' and order.status == 'pending':
            order.status = new_status
            order.updated_at = datetime.utcnow()

            # Restore stock
            for item in order.items:
                if item.product:
                    item.product.stock += item.quantity

            db.session.commit()

            return jsonify({
                'message': 'Order cancelled successfully',
                'order': order.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Cannot update order status'}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# CANCEL ORDER
# =========================================

@bp.route('/<int:order_id>/cancel', methods=['POST'])
@login_required
def cancel_order(order_id):
    """Cancel an order"""
    try:
        user_id = session.get('user_id')

        order = Order.query.filter_by(id=order_id, user_id=user_id).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        if order.status != 'pending':
            return jsonify({'error': 'Only pending orders can be cancelled'}), 400

        order.status = 'cancelled'
        order.updated_at = datetime.utcnow()

        # Restore stock
        for item in order.items:
            if item.product:
                item.product.stock += item.quantity

        db.session.commit()

        return jsonify({
            'message': 'Order cancelled successfully',
            'order': order.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# GET ORDER STATISTICS
# =========================================

@bp.route('/stats', methods=['GET'])
@login_required
def get_order_stats():
    """Get order statistics for current user"""
    try:
        user_id = session.get('user_id')

        orders = Order.query.filter_by(user_id=user_id).all()

        total_orders = len(orders)
        total_spent = sum(order.total_amount for order in orders)

        status_counts = {}
        for order in orders:
            status_counts[order.status] = status_counts.get(order.status, 0) + 1

        return jsonify({
            'total_orders': total_orders,
            'total_spent': total_spent,
            'status_breakdown': status_counts
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500