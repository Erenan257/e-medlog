from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

# Define o prefixo base para todas as rotas deste arquivo
# Assim, as rotas serão: /api/pedidos/, /api/pedidos/1, /api/pedidos/meus-atendidos/1
bp = Blueprint('pedidos', __name__, url_prefix='/api/pedidos')

# ---------------------------------------------------------
# ROTA 1: Listar todos os pedidos (usada pelo Gestor/Farmácia)
# ---------------------------------------------------------
@bp.route('/', methods=['GET'])
def get_pedidos():
    try:
        status_filtro = request.args.get('status')
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = """SELECT p.ID_Pedido, p.Status_Pedido, p.Data_Hora_Solicitacao,
                        u.Nome as Nome_Solicitante, a.Placa as Placa_Ambulancia
                 FROM Pedido_Reposicao p
                 JOIN Usuario u ON p.ID_Socorrista_Solicitante = u.ID_Usuario
                 JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
                 JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia"""
        
        params = []
        if status_filtro:
            sql += " WHERE p.Status_Pedido = %s"
            params.append(status_filtro)
            
        sql += " ORDER BY p.Data_Hora_Solicitacao DESC"
        
        cursor.execute(sql, params)
        pedidos = cursor.fetchall()
        
        # Formata datas para string antes de enviar
        for pedido in pedidos:
            if pedido['Data_Hora_Solicitacao']:
                pedido['Data_Hora_Solicitacao'] = pedido['Data_Hora_Solicitacao'].isoformat()
                
        return jsonify(pedidos)
    except Exception as e:
        return jsonify(message="Erro ao buscar pedidos.", error=str(e)), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# ---------------------------------------------------------
# ROTA 2: Detalhes de um pedido e Atualização de Status
# ---------------------------------------------------------
@bp.route('/<int:id_pedido>', methods=['GET', 'PATCH'])
def handle_pedido_by_id(id_pedido):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'GET':
        try:
            sql_pedido = """SELECT p.ID_Pedido, p.Status_Pedido, p.Data_Hora_Solicitacao, 
                                   u.Nome as Nome_Solicitante, a.Placa as Placa_Ambulancia
                            FROM Pedido_Reposicao p
                            JOIN Usuario u ON p.ID_Socorrista_Solicitante = u.ID_Usuario
                            JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
                            JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia
                            WHERE p.ID_Pedido = %s"""
            cursor.execute(sql_pedido, (id_pedido,))
            pedido = cursor.fetchone()
            
            if not pedido: 
                return jsonify({"status": "erro", "message": "Pedido não encontrado"}), 404
            
            sql_itens = """SELECT i.Nome_Insumo, ip.Quantidade_Solicitada
                           FROM Itens_Pedido ip 
                           JOIN Insumo i ON ip.ID_Insumo = i.ID_Insumo
                           WHERE ip.ID_Pedido = %s"""
            cursor.execute(sql_itens, (id_pedido,))
            itens = cursor.fetchall()
            
            pedido['itens'] = itens
            if pedido['Data_Hora_Solicitacao']: 
                pedido['Data_Hora_Solicitacao'] = pedido['Data_Hora_Solicitacao'].isoformat()
            
            return jsonify(pedido)
        except Exception as e:
            return jsonify(message="Erro ao buscar detalhes.", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()

    elif request.method == 'PATCH':
        dados = request.get_json()
        if not dados or 'status' not in dados: 
            return jsonify({"status": "erro", "message": "Novo status não fornecido"}), 400
        
        try:
            sql = "UPDATE Pedido_Reposicao SET Status_Pedido = %s WHERE ID_Pedido = %s"
            cursor.execute(sql, (dados['status'], id_pedido))
            conn.commit()
            return jsonify({"status": "sucesso", "message": f"Status atualizado."})
        except Exception as e:
            return jsonify(message="Erro ao atualizar.", error=str(e)), 500
        finally:
            cursor.close()
            conn.close()

# ---------------------------------------------------------
# ROTA 3: Meus Pedidos Atendidos (PARA O AVISO DO SOCORRISTA)
# ---------------------------------------------------------
@bp.route('/meus-atendidos/<int:id_usuario>', methods=['GET'])
def get_meus_pedidos_atendidos(id_usuario):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Busca pedidos deste usuário que já foram 'Atendido'
        # Ordena pelo mais recente e limita a 5 para não poluir a tela
        sql = """
            SELECT p.ID_Pedido, p.Data_Hora_Solicitacao, a.Placa
            FROM Pedido_Reposicao p
            JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
            JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia
            WHERE p.ID_Socorrista_Solicitante = %s 
            AND p.Status_Pedido = 'Atendido'
            ORDER BY p.Data_Hora_Solicitacao DESC
            LIMIT 1
        """
        
        cursor.execute(sql, (id_usuario,))
        pedidos = cursor.fetchall()
        
        for p in pedidos:
            if p['Data_Hora_Solicitacao']:
                p['Data_Hora_Solicitacao'] = p['Data_Hora_Solicitacao'].isoformat()
                
        return jsonify(pedidos)
        
    except Exception as e:
        print(f"Erro na rota meus-atendidos: {e}") 
        return jsonify(message="Erro ao buscar avisos", error=str(e)), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()