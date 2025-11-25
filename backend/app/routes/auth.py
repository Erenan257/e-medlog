# backend/app/routes/auth.py

from flask import Blueprint, request, jsonify
from app import bcrypt, get_db_connection
import mysql.connector

# O prefixo /api será adicionado antes de /login e /registrar
bp = Blueprint('auth', __name__, url_prefix='/api')

@bp.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    if not dados or not 'email' in dados or not 'senha' in dados:
        return jsonify({"status": "erro", "message": "Dados de login ausentes"}), 400

    email = dados['email']
    senha_texto_puro = dados['senha']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM Usuario WHERE Email = %s AND is_active = TRUE"
        cursor.execute(sql, (email,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()

        if usuario and bcrypt.check_password_hash(usuario['Senha_Criptografada'], senha_texto_puro):
            del usuario['Senha_Criptografada']
            del usuario['is_active']
            return jsonify({
                "status": "sucesso",
                "message": "Login bem-sucedido!",
                "usuario": usuario
            })
        else:
            return jsonify({"status": "erro", "message": "E-mail ou senha inválidos"}), 401
    except Exception as e:
        return jsonify(message="Erro interno no servidor.", error=str(e)), 500

@bp.route('/registrar', methods=['POST'])
def registrar_usuario():
    dados = request.get_json()
    required_fields = ['nome', 'email', 'senha', 'perfil']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados de registro incompletos"}), 400

    nome = dados['nome'].title()
    email = dados['email']
    senha_texto_puro = dados['senha']
    perfil = dados['perfil'].capitalize()

    hash_senha = bcrypt.generate_password_hash(senha_texto_puro).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO Usuario (Nome, Email, Senha_Criptografada, Perfil) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (nome, email, hash_senha, perfil))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "sucesso", "message": "Usuário registrado com sucesso!"}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
             return jsonify({"status": "erro", "message": "Este e-mail já está em uso."}), 409
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500
    
@bp.route('/alterar-senha', methods=['POST'])
def alterar_senha():
    dados = request.get_json()
    if not dados or not all(k in dados for k in ('id_usuario', 'senha_atual', 'nova_senha')):
        return jsonify({"status": "erro", "message": "Dados incompletos"}), 400

    id_usuario = dados['id_usuario']
    senha_atual = dados['senha_atual']
    nova_senha = dados['nova_senha']

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Busca a senha atual do banco para conferir
        cursor.execute("SELECT Senha_Criptografada FROM Usuario WHERE ID_Usuario = %s", (id_usuario,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404

        # 2. Verifica se a senha atual bate
        if not bcrypt.check_password_hash(usuario['Senha_Criptografada'], senha_atual):
            return jsonify({"status": "erro", "message": "Senha atual incorreta"}), 401

        # 3. Criptografa a nova senha e atualiza
        novo_hash = bcrypt.generate_password_hash(nova_senha).decode('utf-8')
        
        cursor.close() # Fecha cursor de leitura
        
        cursor = conn.cursor() # Abre cursor de escrita
        cursor.execute("UPDATE Usuario SET Senha_Criptografada = %s WHERE ID_Usuario = %s", (novo_hash, id_usuario))
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({"status": "sucesso", "message": "Senha alterada com sucesso!"})

    except Exception as e:
        return jsonify(message="Erro ao alterar senha", error=str(e)), 500