"""
GIRLHUB BY DEBBS - USERS ROUTES (routes/users.py)
User profile and preferences endpoints
"""

from flask import Blueprint, request, jsonify, session
from models import User, Address, WishlistItem, Product
from app import db
from datetime import datetime

bp = Blueprint('users', __name__, url_prefix='/api/users')


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


# =========================================
# GET USER PROFILE
# =========================================

@bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Get current user profile"""
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# UPDATE USER PROFILE
# =========================================

@bp.route('/profile', methods=['PUT', 'PATCH'])
@login_required
def update_profile():
    """Update user profile"""
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        # Update allowed fields
        if 'name' in data:
            user.name = data['name'].strip()

        if 'phone' in data:
            user.phone = data['phone'].strip()

        if 'birthday' in data and data['birthday']:
            try:
                user.birthday = datetime.fromisoformat(data['birthday']).date()
            except ValueError:
                return jsonify({'error': 'Invalid birthday format'}), 400

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# DELETE USER ACCOUNT
# =========================================

@bp.route('/profile', methods=['DELETE'])
@login_required
def delete_account():
    """Delete user account"""
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Delete user (cascade will delete related records)
        db.session.delete(user)
        db.session.commit()

        # Clear session
        session.clear()

        return jsonify({'message': 'Account deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# GET USER ADDRESSES
# =========================================

@bp.route('/addresses', methods=['GET'])
@login_required
def get_addresses():
    """Get all addresses for current user"""
    try:
        user_id = session.get('user_id')
        addresses = Address.query.filter_by(user_id=user_id).order_by(Address.is_default.desc()).all()

        return jsonify({
            'addresses': [addr.to_dict() for addr in addresses]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# ADD ADDRESS
# =========================================

@bp.route('/addresses', methods=['POST'])
@login_required
def add_address():
    """Add new address"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'phone', 'street', 'city', 'region']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # If this is the first address or explicitly set as default, make it default
        is_default = data.get('is_default', False)
        if is_default or Address.query.filter_by(user_id=user_id).count() == 0:
            # Remove default from other addresses
            Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
            is_default = True

        address = Address(
            user_id=user_id,
            label=data.get('label'),
            name=data['name'],
            phone=data['phone'],
            street=data['street'],
            city=data['city'],
            region=data['region'],
            postal_code=data.get('postal_code'),
            country=data.get('country', 'Ghana'),
            is_default=is_default
        )

        db.session.add(address)
        db.session.commit()

        return jsonify({
            'message': 'Address added successfully',
            'address': address.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# UPDATE ADDRESS
# =========================================

@bp.route('/addresses/<int:address_id>', methods=['PUT', 'PATCH'])
@login_required
def update_address(address_id):
    """Update an address"""
    try:
        user_id = session.get('user_id')
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()

        if not address:
            return jsonify({'error': 'Address not found'}), 404

        data = request.get_json()

        # Update fields
        if 'label' in data:
            address.label = data['label']
        if 'name' in data:
            address.name = data['name']
        if 'phone' in data:
            address.phone = data['phone']
        if 'street' in data:
            address.street = data['street']
        if 'city' in data:
            address.city = data['city']
        if 'region' in data:
            address.region = data['region']
        if 'postal_code' in data:
            address.postal_code = data['postal_code']
        if 'country' in data:
            address.country = data['country']

        # Handle default status
        if 'is_default' in data and data['is_default']:
            Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
            address.is_default = True

        address.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Address updated successfully',
            'address': address.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# DELETE ADDRESS
# =========================================

@bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@login_required
def delete_address(address_id):
    """Delete an address"""
    try:
        user_id = session.get('user_id')
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()

        if not address:
            return jsonify({'error': 'Address not found'}), 404

        db.session.delete(address)
        db.session.commit()

        return jsonify({'message': 'Address deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# GET WISHLIST
# =========================================

@bp.route('/wishlist', methods=['GET'])
@login_required
def get_wishlist():
    """Get user's wishlist"""
    try:
        user_id = session.get('user_id')
        wishlist_items = WishlistItem.query.filter_by(user_id=user_id).all()

        return jsonify({
            'wishlist': [item.to_dict() for item in wishlist_items],
            'count': len(wishlist_items)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# ADD TO WISHLIST
# =========================================

@bp.route('/wishlist', methods=['POST'])
@login_required
def add_to_wishlist():
    """Add product to wishlist"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()

        product_id = data.get('product_id')

        if not product_id:
            return jsonify({'error': 'Product ID required'}), 400

        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404

        # Check if already in wishlist
        existing = WishlistItem.query.filter_by(user_id=user_id, product_id=product_id).first()
        if existing:
            return jsonify({'error': 'Product already in wishlist'}), 409

        # Add to wishlist
        wishlist_item = WishlistItem(user_id=user_id, product_id=product_id)
        db.session.add(wishlist_item)
        db.session.commit()

        return jsonify({
            'message': 'Added to wishlist',
            'item': wishlist_item.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# REMOVE FROM WISHLIST
# =========================================

@bp.route('/wishlist/<int:product_id>', methods=['DELETE'])
@login_required
def remove_from_wishlist(product_id):
    """Remove product from wishlist"""
    try:
        user_id = session.get('user_id')

        wishlist_item = WishlistItem.query.filter_by(
            user_id=user_id,
            product_id=product_id
        ).first()

        if not wishlist_item:
            return jsonify({'error': 'Item not in wishlist'}), 404

        db.session.delete(wishlist_item)
        db.session.commit()

        return jsonify({'message': 'Removed from wishlist'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# CLEAR WISHLIST
# =========================================

@bp.route('/wishlist/clear', methods=['DELETE'])
@login_required
def clear_wishlist():
    """Clear entire wishlist"""
    try:
        user_id = session.get('user_id')

        WishlistItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        return jsonify({'message': 'Wishlist cleared'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500