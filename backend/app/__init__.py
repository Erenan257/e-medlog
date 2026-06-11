
import os
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector


bcrypt = Bcrypt()
cors = CORS(resources={r"/api/*": {"origins": "*"}})

def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "db"),
        user="renan",
        password="FAmilia36#",
        database="emlog_db"
    )
    return conn

def create_app():
    app = Flask(__name__)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}) 

    
    from .routes import auth
    from .routes import usuarios
    from .routes import insumos
    from .routes import pedidos
    from .routes import checklists
    from .routes import ambulancias
    
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(usuarios.bp)
    app.register_blueprint(insumos.bp)
    app.register_blueprint(pedidos.bp)
    app.register_blueprint(checklists.bp)
    app.register_blueprint(ambulancias.bp)
    
    @app.route('/health')
    def health_check():
        return "Servidor Flask está saudável!"

    return app