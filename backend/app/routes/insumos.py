from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('insumos', __name__, url_prefix='/api')

@bp.route('/insumos', methods=['GET', 'POST'])
def handle_insumos():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        try:
            
            cursor.execute('SELECT * FROM Insumo WHERE is_active = TRUE ORDER BY Nome_Insumo ASC')
            insumos = cursor.fetchall()
            return jsonify(insumos)
        except Exception as e:
            return jsonify(message="Erro ao buscar insumos.", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'POST':
        dados = request.get_json()
        required_fields = ['nome_insumo', 'unidade_medida', 'quantidade_minima']
        if not all(field in dados for field in required_fields):
            return jsonify({"status": "erro", "message": "Dados do insumo incompletos"}), 400
        
        try:
            
            sql = "INSERT INTO Insumo (Nome_Insumo, Unidade_Medida, Quantidade_Minima, Descricao, Critico, Categoria) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (
                dados['nome_insumo'], dados['unidade_medida'], dados['quantidade_minima'],
                dados.get('descricao', ''), dados.get('critico', False), dados.get('categoria', '')
            ))
            conn.commit()
            id_novo_insumo = cursor.lastrowid
            return jsonify({"status": "sucesso", "message": "Insumo criado com sucesso!", "id_insumo": id_novo_insumo}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "erro", "message": "Erro no banco de dados ao criar insumo.", "error": str(err)}), 500
        finally:
            cursor.close()
            conn.close()

@bp.route('/insumos/<int:id_insumo>', methods=['GET', 'PUT', 'DELETE'])
def handle_insumo_by_id(id_insumo):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        cursor.execute("SELECT * FROM Insumo WHERE ID_Insumo = %s", (id_insumo,))
        insumo = cursor.fetchone()
        cursor.close()
        conn.close()
        if insumo:
            return jsonify(insumo)
        else:
            return jsonify({"status": "erro", "message": "Insumo não encontrado"}), 404

    elif request.method == 'PUT':
        dados = request.get_json()
        try:
            sql = "UPDATE Insumo SET Nome_Insumo = %s, Unidade_Medida = %s, Quantidade_Minima = %s, Descricao = %s, Critico = %s, Categoria = %s WHERE ID_Insumo = %s"
            cursor.execute(sql, (
                dados['nome_insumo'], dados['unidade_medida'], dados['quantidade_minima'],
                dados.get('descricao', ''), dados.get('critico', False), dados.get('categoria', ''),
                id_insumo
            ))
            conn.commit()
            return jsonify({"status": "sucesso", "message": "Insumo atualizado."})
        except Exception as e:
            return jsonify({"status": "erro", "message": str(e)}), 500
        finally:
            cursor.close()
            conn.close()
    
    elif request.method == 'DELETE':
        try:
           
            sql = "UPDATE Insumo SET is_active = FALSE WHERE ID_Insumo = %s"
            cursor.execute(sql, (id_insumo,))
            conn.commit()
            
            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "message": "Insumo não encontrado"}), 404
            
            return jsonify({"status": "sucesso", "message": "Insumo excluido com sucesso."})
        except Exception as e:
            return jsonify({"status": "erro", "message": str(e)}), 500
        finally:
            cursor.close()
            conn.close()