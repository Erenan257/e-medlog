from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('ambulancias', __name__, url_prefix='/api')

@bp.route('/ambulancias', methods=['GET', 'POST'])
def handle_ambulancias():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        try:
            cursor.execute("SELECT * FROM Ambulancia ORDER BY Placa ASC")
            ambulancias = cursor.fetchall()
            return jsonify(ambulancias)
        except Exception as e:
            return jsonify(message="Erro ao buscar ambulâncias", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'POST':
        dados = request.get_json()
        if not dados or not 'placa' in dados or not 'tipo' in dados:
            return jsonify({"status": "erro", "message": "Dados incompletos"}), 400
        
        try:
            sql = "INSERT INTO Ambulancia (Placa, Tipo_Ambulancia, Status_Operacional) VALUES (%s, %s, %s)"
            status = dados.get('status', 'Apto') 
            cursor.execute(sql, (dados['placa'], dados['tipo'], status))
            conn.commit()
            return jsonify({"status": "sucesso", "message": "Ambulância criada!"}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "erro", "message": "Erro ao criar ambulância", "error": str(err)}), 500
        finally:
            cursor.close()
            conn.close()

@bp.route('/ambulancias/<int:id_ambulancia>', methods=['GET', 'PUT', 'DELETE'])
def handle_ambulancia_id(id_ambulancia):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # 1. ROTA GET 
    if request.method == 'GET':
        try:
            cursor.execute("SELECT * FROM Ambulancia WHERE ID_Ambulancia = %s", (id_ambulancia,))
            amb = cursor.fetchone()
            if amb:
                return jsonify(amb)
            return jsonify({"status": "erro", "message": "Ambulância não encontrada"}), 404
        finally:
            cursor.close()
            conn.close()

    # 2. ROTA PUT 
    elif request.method == 'PUT':
        dados = request.get_json()
        try:
            
            cursor.execute("SELECT * FROM Ambulancia WHERE ID_Ambulancia = %s", (id_ambulancia,))
            atual = cursor.fetchone()
            if not atual:
                return jsonify({"status": "erro", "message": "Ambulância não encontrada"}), 404

            
            nova_placa = dados.get('placa', atual['Placa'])
            novo_tipo = dados.get('tipo', atual['Tipo_Ambulancia'])
            novo_status = dados.get('status', atual['Status_Operacional'])
            novo_motivo = dados.get('motivo', atual['Motivo_Indisponibilidade'])

            sql = """UPDATE Ambulancia 
                     SET Placa = %s, Tipo_Ambulancia = %s, Status_Operacional = %s, Motivo_Indisponibilidade = %s
                     WHERE ID_Ambulancia = %s"""
            
            cursor.execute(sql, (nova_placa, novo_tipo, novo_status, novo_motivo, id_ambulancia))
            conn.commit()
            
            return jsonify({"status": "sucesso", "message": "Ambulância atualizada"})
        except Exception as e:
            return jsonify({"status": "erro", "message": str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    # 3. ROTA DELETE 
    elif request.method == 'DELETE':
        try:
            cursor.execute("DELETE FROM Ambulancia WHERE ID_Ambulancia = %s", (id_ambulancia,))
            conn.commit()
            return jsonify({"status": "sucesso", "message": "Ambulância excluída"})
        except mysql.connector.Error as err:
            if err.errno == 1451:
                return jsonify({"status": "erro", "message": "Não é possível excluir: esta ambulância possui histórico."}), 409
            return jsonify({"status": "erro", "message": str(err)}), 500
        finally:
            cursor.close()
            conn.close()
            
@bp.route('/ambulancias/<int:id_ambulancia>/itens', methods=['POST'])
def salvar_inventario_padrao(id_ambulancia):
    dados = request.get_json() 
    
    if not dados or not isinstance(dados, list):
        return jsonify({"status": "erro", "message": "Formato inválido. Envie uma lista."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        
        cursor.execute("DELETE FROM Inventario_Padrao WHERE ID_Ambulancia = %s", (id_ambulancia,))
        
        sql_insert = "INSERT INTO Inventario_Padrao (ID_Ambulancia, ID_Insumo, Quantidade_Padrao) VALUES (%s, %s, %s)"
        
        for item in dados:
            
            if int(item['qtd']) > 0:
                cursor.execute(sql_insert, (id_ambulancia, item['id_insumo'], item['qtd']))
        
        conn.commit()
        return jsonify({"status": "sucesso", "message": "Kit da ambulância atualizado com sucesso!"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "erro", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bp.route('/ambulancias/<int:id_ambulancia>/itens', methods=['GET'])
def get_inventario_padrao(id_ambulancia):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        
        sql = """
            SELECT i.ID_Insumo, i.Nome_Insumo, i.Unidade_Medida, i.Critico,
                   pad.Quantidade_Padrao as Quantidade_Minima
            FROM Inventario_Padrao pad
            JOIN Insumo i ON pad.ID_Insumo = i.ID_Insumo
            WHERE pad.ID_Ambulancia = %s AND i.is_active = TRUE
            ORDER BY i.Nome_Insumo ASC
        """
        cursor.execute(sql, (id_ambulancia,))
        itens = cursor.fetchall()
        return jsonify(itens)
    except Exception as e:
        return jsonify({"status": "erro", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()