# backend/app/routes/usuarios.py

from flask import Blueprint, request, jsonify
from app import bcrypt, get_db_connection
import mysql.connector

# O prefixo /api/usuarios será adicionado a todas as rotas abaixo
bp = Blueprint('usuarios', __name__, url_prefix='/api')

# Rota para LISTAR (GET) e CRIAR (POST) usuários
@bp.route('/usuarios', methods=['GET', 'POST'])
def handle_usuarios():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        try:
            sql = "SELECT ID_Usuario, Nome, Email, Perfil, is_active FROM Usuario ORDER BY Nome ASC"
            cursor.execute(sql)
            usuarios = cursor.fetchall()
            return jsonify(usuarios)
        except Exception as e:
            return jsonify(message="Erro ao buscar usuários.", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()
    
    elif request.method == 'POST':
        dados = request.get_json()
        required_fields = ['nome', 'email', 'senha', 'perfil']
        if not all(field in dados for field in required_fields): 
            return jsonify({"status": "erro", "message": "Dados incompletos"}), 400
        
        nome = dados['nome'].title()
        email = dados['email']
        senha_texto_puro = dados['senha']
        perfil = dados['perfil'].capitalize()
        hash_senha = bcrypt.generate_password_hash(senha_texto_puro).decode('utf-8')
        
        try:
            sql = "INSERT INTO Usuario (Nome, Email, Senha_Criptografada, Perfil) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (nome, email, hash_senha, perfil))
            conn.commit()
            id_novo_usuario = cursor.lastrowid
            return jsonify({"status": "sucesso", "message": "Usuário criado com sucesso!", "id_usuario": id_novo_usuario}), 201
        except mysql.connector.Error as err:
            if err.errno == 1062: 
                return jsonify({"status": "erro", "message": "Este e-mail já está em uso."}), 409
            return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500
        finally:
            cursor.close()
            conn.close()

# Rota para EDITAR (PUT), INATIVAR (DELETE) e REATIVAR (PATCH) um usuário
@bp.route('/usuarios/<int:id_usuario>', methods=['GET', 'PUT', 'DELETE', 'PATCH'])
def handle_usuario_by_id(id_usuario):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        try:
            sql = "SELECT ID_Usuario, Nome, Email, Perfil FROM Usuario WHERE ID_Usuario = %s"
            cursor.execute(sql, (id_usuario,))
            usuario = cursor.fetchone()
            if usuario:
                return jsonify(usuario)
            else:
                return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404
        except Exception as e:
            return jsonify(message="Erro ao buscar usuário.", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'PUT':
        dados = request.get_json()
        required_fields = ['nome', 'email', 'perfil']
        if not all(field in dados for field in required_fields): 
            return jsonify({"status": "erro", "message": "Dados de atualização incompletos"}), 400
        
        nome = dados['nome'].title()
        email = dados['email']
        perfil = dados['perfil'].capitalize()
        
        try:
            sql = "UPDATE Usuario SET Nome = %s, Email = %s, Perfil = %s WHERE ID_Usuario = %s"
            cursor.execute(sql, (nome, email, perfil, id_usuario))
            conn.commit()
            if cursor.rowcount == 0: 
                return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404
            return jsonify({"status": "sucesso", "message": f"Usuário com ID {id_usuario} atualizado com sucesso."})
        except mysql.connector.Error as err:
            if err.errno == 1062: 
                return jsonify({"status": "erro", "message": "Este e-mail já está em uso por outro usuário."}), 409
            return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'DELETE' or request.method == 'PATCH':
        # --- TRAVA DE SEGURANÇA: SUPER ADMIN ---
        # Impede que o usuário ID 1 seja inativado ou excluído
        if id_usuario == 1:
            return jsonify({"status": "erro", "message": "OPERAÇÃO NEGADA: O Super Admin não pode ser inativado."}), 403
        # ---------------------------------------

        is_active = request.method == 'PATCH'
        if request.method == 'PATCH':
            dados = request.get_json()
            if not dados or 'is_active' not in dados: 
                return jsonify({"status": "erro", "message": "Nenhuma ação de status fornecida"}), 400
            is_active = bool(dados['is_active'])

        try:
            sql = "UPDATE Usuario SET is_active = %s WHERE ID_Usuario = %s"
            cursor.execute(sql, (is_active, id_usuario))
            conn.commit()
            if cursor.rowcount == 0: 
                return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404
            
            status_texto = "reativado" if is_active else "inativado"
            return jsonify({"status": "sucesso", "message": f"Usuário com ID {id_usuario} foi {status_texto}."})
        except Exception as e:
            return jsonify(message="Erro interno no servidor.", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()