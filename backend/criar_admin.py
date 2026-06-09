import os
import mysql.connector
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

# Carrega as senhas do .env
load_dotenv()

# Inicia a ferramenta de criptografia
bcrypt = Bcrypt()

def criar_super_usuario():
    # Defina aqui os dados do seu administrador
    nome_admin = "Administrador Emedlog"
    email_admin = "erenan257@gmail.com"
    senha_plana = "84542397" # Troque para a senha que você quiser usar
    
    # Criptografa a senha antes de salvar no banco
    senha_criptografada = bcrypt.generate_password_hash(senha_plana).decode('utf-8')

    try:
        # Conecta ao banco de dados
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        cursor = conn.cursor()

        # Prepara o comando SQL com as colunas EXATAS do seu schema.sql
        sql = "INSERT INTO Usuario (Nome, Email, Senha_Criptografada, Perfil) VALUES (%s, %s, %s, %s)"
        
        # Passa os valores (Repare no 'Gestor' adicionado no final)
        valores = (nome_admin, email_admin, senha_criptografada, 'Gestor')

        # Executa e salva as mudanças
        cursor.execute(sql, valores)
        conn.commit()

        print("\n=== SUCESSO ===")
        print(f"Gestor '{nome_admin}' criado com sucesso!")
        print(f"E-mail para login: {email_admin}")
        print("=================\n")

    except Exception as e:
        print(f"\nErro ao criar usuário: {e}\n")
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    criar_super_usuario()