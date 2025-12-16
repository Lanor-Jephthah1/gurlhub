"""
GIRLHUB BY DEBBS - AUTHENTICATION ROUTES (routes/auth.py)
User authentication endpoints
"""

from flask import Blueprint, request, jsonify, session
from models import User
from app import db
from datetime import datetime
import re

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# =========================================
# HELPER FUNCTIONS
# =========================================

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength (min 8 chars, 1 uppercase, 1 number)"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True


# =========================================
# REGISTRATION ENDPOINT
# =========================================

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        # Validate required fields
        if not all(k in data for k in ('name', 'email', 'password')):
            return jsonify({'error': 'Missing required fields'}), 400

        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']

        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password strength
        if not validate_password(password):
            return jsonify({
                'error': 'Password must be at least 8 characters with 1 uppercase and 1 number'
            }), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409

        # Create new user
        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Log user in
        session['user_id'] = user.id
        session['user_email'] = user.email
        session.permanent = True

        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================
# LOGIN ENDPOINT
# =========================================

@bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and create session"""
    try:
        data = request.get_json()

        # Validate required fields
        if not all(k in data for k in ('email', 'password')):
            return jsonify({'error': 'Email and password required'}), 400

        email = data['email'].strip().lower()
        password = data['password']
        remember_me = data.get('remember_me', False)

        # Find user
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Create session
        session['user_id'] = user.id
        session['user_email'] = user.email
        session.permanent = remember_me

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# LOGOUT ENDPOINT
# =========================================

@bp.route('/logout', methods=['POST'])
def logout():
    """Clear user session"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200


# =========================================
# GET CURRENT USER
# =========================================

@bp.route('/me', methods=['GET'])
def get_current_user():
    """Get currently logged in user"""
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401

    user = User.query.get(user_id)

    if not user:
        session.clear()
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200


# =========================================
# CHECK SESSION STATUS
# =========================================

@bp.route('/check', methods=['GET'])
def check_session():
    """Check if user has active session"""
    user_id = session.get('user_id')

    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                'authenticated': True,
                'user': user.to_dict()
            }), 200

    return jsonify({'authenticated': False}), 200


# =========================================
# PASSWORD RESET REQUEST
# =========================================

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset (placeholder for email functionality)"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'error': 'Email required'}), 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()

        if not user:
            # Don't reveal whether email exists
            return jsonify({
                'message': 'If the email exists, a reset link has been sent'
            }), 200

        # TODO: Implement email sending functionality
        # For now, just return success message

        return jsonify({
            'message': 'Password reset link sent to your email'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# CHANGE PASSWORD (LOGGED IN)
# =========================================

@bp.route('/change-password', methods=['POST'])
def change_password():
    """Change password for logged in user"""
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not all([current_password, new_password]):
            return jsonify({'error': 'All fields required'}), 400

        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # Validate new password
        if not validate_password(new_password):
            return jsonify({
                'error': 'Password must be at least 8 characters with 1 uppercase and 1 number'
            }), 400

        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500