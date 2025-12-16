"""
GIRLHUB BY DEBBS - PRODUCTS ROUTES (routes/products.py)
Product catalog endpoints
"""

from flask import Blueprint, request, jsonify
from models import Product
from app import db
from sqlalchemy import or_

bp = Blueprint('products', __name__, url_prefix='/api/products')


# =========================================
# GET ALL PRODUCTS
# =========================================

@bp.route('', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    try:
        # Get query parameters
        category = request.args.get('category')
        search = request.args.get('search')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        sort_by = request.args.get('sort_by', 'featured')
        limit = request.args.get('limit', type=int)

        # Start with base query
        query = Product.query.filter_by(is_active=True)

        # Apply filters
        if category and category != 'all':
            query = query.filter_by(category=category)

        if search:
            search_term = f'%{search}%'
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.tags.ilike(search_term),
                    Product.category.ilike(search_term)
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)

        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Apply sorting
        if sort_by == 'price-low':
            query = query.order_by(Product.price.asc())
        elif sort_by == 'price-high':
            query = query.order_by(Product.price.desc())
        elif sort_by == 'name':
            query = query.order_by(Product.name.asc())
        else:  # featured (default)
            query = query.order_by(Product.id.asc())

        # Apply limit if specified
        if limit:
            query = query.limit(limit)

        products = query.all()

        return jsonify({
            'products': [p.to_dict() for p in products],
            'count': len(products)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET SINGLE PRODUCT
# =========================================

@bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID"""
    try:
        product = Product.query.get(product_id)

        if not product or not product.is_active:
            return jsonify({'error': 'Product not found'}), 404

        return jsonify({'product': product.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET CATEGORIES
# =========================================

@bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    try:
        categories = db.session.query(Product.category).distinct().all()
        category_list = [cat[0] for cat in categories]

        return jsonify({'categories': category_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET FEATURED PRODUCTS
# =========================================

@bp.route('/featured', methods=['GET'])
def get_featured():
    """Get featured products (first 4 by default)"""
    try:
        limit = request.args.get('limit', 4, type=int)

        products = Product.query.filter_by(is_active=True).limit(limit).all()

        return jsonify({
            'products': [p.to_dict() for p in products]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# SEARCH PRODUCTS
# =========================================

@bp.route('/search', methods=['GET'])
def search_products():
    """Search products by name, description, or tags"""
    try:
        query_term = request.args.get('q', '')

        if not query_term or len(query_term) < 2:
            return jsonify({'products': [], 'message': 'Search term too short'}), 200

        search_term = f'%{query_term}%'

        products = Product.query.filter(
            Product.is_active == True,
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.tags.ilike(search_term),
                Product.category.ilike(search_term)
            )
        ).all()

        return jsonify({
            'products': [p.to_dict() for p in products],
            'count': len(products),
            'query': query_term
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# GET RELATED PRODUCTS
# =========================================

@bp.route('/<int:product_id>/related', methods=['GET'])
def get_related_products(product_id):
    """Get related products based on category"""
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        # Get products from same category
        related = Product.query.filter(
            Product.id != product_id,
            Product.category == product.category,
            Product.is_active == True
        ).limit(4).all()

        return jsonify({
            'products': [p.to_dict() for p in related]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =========================================
# CHECK PRODUCT STOCK
# =========================================

@bp.route('/<int:product_id>/stock', methods=['GET'])
def check_stock(product_id):
    """Check product stock availability"""
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        quantity = request.args.get('quantity', 1, type=int)

        available = product.stock >= quantity

        return jsonify({
            'available': available,
            'stock': product.stock,
            'requested': quantity
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500