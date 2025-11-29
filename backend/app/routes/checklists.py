
from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('checklists', __name__, url_prefix='/api')


@bp.route('/checklists', methods=['GET', 'POST'])
def handle_checklists():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            sql = """
                SELECT ck.ID_Checklist, ck.Data_Hora_Preenchimento, ck.Turno, ck.Status_Final_Ambulancia,
                       usr.Nome as Nome_Socorrista, amb.Placa as Placa_Ambulancia
                FROM Checklist_Diario ck
                JOIN Usuario usr ON ck.ID_Socorrista = usr.ID_Usuario
                JOIN Ambulancia amb ON ck.ID_Ambulancia = amb.ID_Ambulancia
                ORDER BY ck.Data_Hora_Preenchimento DESC
            """
            cursor.execute(sql)
            checklists = cursor.fetchall()
            cursor.close()
            conn.close()
            for checklist in checklists:
                if checklist['Data_Hora_Preenchimento']:
                    checklist['Data_Hora_Preenchimento'] = checklist['Data_Hora_Preenchimento'].isoformat()
            return jsonify(checklists)
        except Exception as e:
            return jsonify(message="Erro ao buscar checklists.", error=str(e)), 500
    
    elif request.method == 'POST':
        dados = request.get_json()
        required_fields = ['id_ambulancia', 'id_socorrista', 'turno', 'itens']
        if not all(field in dados for field in required_fields):
            return jsonify({"status": "erro", "message": "Dados incompletos"}), 400
        
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True) 

           
            sql_checklist = "INSERT INTO Checklist_Diario (ID_Ambulancia, ID_Socorrista, Turno, Observacoes_Gerais, Status_Final_Ambulancia) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql_checklist, (dados['id_ambulancia'], dados['id_socorrista'], dados['turno'], dados.get('observacoes', ''), 'Revisado'))
            id_checklist_criado = cursor.lastrowid

            novo_status = dados.get('status_ambulancia')
            novo_motivo = dados.get('motivo_ambulancia')
            
            if novo_status:
                sql_update_amb = "UPDATE Ambulancia SET Status_Operacional = %s, Motivo_Indisponibilidade = %s WHERE ID_Ambulancia = %s"
                cursor.execute(sql_update_amb, (novo_status, novo_motivo, dados['id_ambulancia']))

            itens_para_reposicao = []

            
            sql_item_checklist = "INSERT INTO Itens_Checklist (ID_Checklist, ID_Insumo, Status_Item, Quantidade_Reportada, Observacoes_Item) VALUES (%s, %s, %s, %s, %s)"
            for item in dados['itens']:
                if not 'id_insumo' in item or not 'quantidade' in item:
                    raise ValueError("Dados de item incompletos (precisa de id_insumo e quantidade)")

                quantidade_reportada = item['quantidade']
                
                
                sql_meta = """
                    SELECT Quantidade_Padrao 
                    FROM Inventario_Padrao 
                    WHERE ID_Ambulancia = %s AND ID_Insumo = %s
                """
                cursor.execute(sql_meta, (dados['id_ambulancia'], item['id_insumo']))
                config_item = cursor.fetchone()
                
                
                quantidade_minima = config_item['Quantidade_Padrao'] if config_item else 0
                
                
                status = 'Presente' if quantidade_reportada >= quantidade_minima else 'Ausente'

                cursor.execute(sql_item_checklist, (id_checklist_criado, item['id_insumo'], status, quantidade_reportada, item.get('observacao', '')))

                
                if quantidade_reportada < quantidade_minima:
                    quantidade_necessaria = quantidade_minima - quantidade_reportada
                    itens_para_reposicao.append({'id_insumo': item['id_insumo'], 'quantidade': quantidade_necessaria})

           
            if itens_para_reposicao:
                sql_pedido = "INSERT INTO Pedido_Reposicao (ID_Checklist, ID_Socorrista_Solicitante, Status_Pedido) VALUES (%s, %s, %s)"
                cursor.execute(sql_pedido, (id_checklist_criado, dados['id_socorrista'], 'Pendente'))
                id_pedido_criado = cursor.lastrowid

                sql_item_pedido = "INSERT INTO Itens_Pedido (ID_Pedido, ID_Insumo, Quantidade_Solicitada) VALUES (%s, %s, %s)"
                for item_repo in itens_para_reposicao:
                    cursor.execute(sql_item_pedido, (id_pedido_criado, item_repo['id_insumo'], item_repo['quantidade']))
            
            conn.commit()
            return jsonify({"status": "sucesso", "message": "Checklist salvo com sucesso!", "id_checklist": id_checklist_criado}), 201

        except (mysql.connector.Error, ValueError, TypeError) as err:
            if conn: conn.rollback()
            return jsonify({"status": "erro", "message": "Erro ao processar checklist.", "error": str(err)}), 500
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()
