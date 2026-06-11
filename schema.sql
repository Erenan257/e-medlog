-- Remove o banco de dados se ele já existir, para começar do zero.
DROP SCHEMA IF EXISTS emlog_db;

-- Cria o banco de dados.
CREATE SCHEMA emlog_db;

-- Seleciona o banco de dados recém-criado para os comandos seguintes.
USE emlog_db;

-- Tabela para armazenar os dados dos usuários do sistema
CREATE TABLE Usuario (
    ID_Usuario INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Senha_Criptografada VARCHAR(255) NOT NULL,
    Perfil ENUM('Socorrista', 'Farmacia', 'Gestor') NOT NULL,
    Matricula_Empresa VARCHAR(50) UNIQUE,
    CPF VARCHAR(14) UNIQUE,
    is_active BOOLEAN DEFAULT 1, -- NOVIDADE: Controle de acesso (Inativar/Reativar)
    Data_Cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as informações das ambulâncias
CREATE TABLE Ambulancia (
    ID_Ambulancia INT PRIMARY KEY AUTO_INCREMENT,
    Placa VARCHAR(10) NOT NULL UNIQUE,
    Tipo_Ambulancia VARCHAR(100),
    Status_Operacional VARCHAR(50) DEFAULT 'Apto',
    Motivo_Indisponibilidade TEXT, -- NOVIDADE: Permite registrar o motivo da baixa da viatura
    Data_Cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para cadastrar todos os tipos de insumos médicos
CREATE TABLE Insumo (
    ID_Insumo INT PRIMARY KEY AUTO_INCREMENT,
    Nome_Insumo VARCHAR(255) NOT NULL,
    Descricao TEXT,
    Unidade_Medida VARCHAR(50),
    Quantidade_Minima INT,
    Critico BOOLEAN DEFAULT FALSE,
    Categoria VARCHAR(100),
    is_active BOOLEAN DEFAULT 1, -- NOVIDADE: Soft Delete (Exclusão suave para não quebrar histórico)
    Data_Cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOVIDADE: Tabela para configurar o Kit Padrão de cada Ambulância
CREATE TABLE Inventario_Padrao (
    ID_Inventario INT PRIMARY KEY AUTO_INCREMENT,
    ID_Ambulancia INT,
    ID_Insumo INT,
    Quantidade_Padrao INT NOT NULL,
    FOREIGN KEY (ID_Ambulancia) REFERENCES Ambulancia(ID_Ambulancia) ON DELETE CASCADE,
    FOREIGN KEY (ID_Insumo) REFERENCES Insumo(ID_Insumo) ON DELETE CASCADE
);

-- Tabela para registrar cada checklist realizado
CREATE TABLE Checklist_Diario (
    ID_Checklist INT PRIMARY KEY AUTO_INCREMENT,
    ID_Ambulancia INT,
    ID_Socorrista INT,
    Data_Hora_Preenchimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Turno VARCHAR(50),
    Status_Final_Ambulancia VARCHAR(50),
    Observacoes_Gerais TEXT,
    FOREIGN KEY (ID_Ambulancia) REFERENCES Ambulancia(ID_Ambulancia),
    FOREIGN KEY (ID_Socorrista) REFERENCES Usuario(ID_Usuario)
);

-- Tabela para registrar os itens verificados em cada checklist
CREATE TABLE Itens_Checklist (
    ID_Itens_Checklist INT PRIMARY KEY AUTO_INCREMENT,
    ID_Checklist INT,
    ID_Insumo INT,
    Status_Item VARCHAR(50),
    Quantidade_Reportada INT, -- NOVIDADE: Guarda a quantidade exata contada pelo Socorrista
    Observacoes_Item TEXT,
    FOREIGN KEY (ID_Checklist) REFERENCES Checklist_Diario(ID_Checklist),
    FOREIGN KEY (ID_Insumo) REFERENCES Insumo(ID_Insumo)
);

-- Tabela para registrar os pedidos de reposição
CREATE TABLE Pedido_Reposicao (
    ID_Pedido INT PRIMARY KEY AUTO_INCREMENT,
    ID_Checklist INT,
    ID_Socorrista_Solicitante INT,
    ID_Farmacia_Responsavel INT,
    Data_Hora_Solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Data_Hora_Entrega TIMESTAMP NULL,
    Status_Pedido VARCHAR(50) DEFAULT 'Pendente',
    FOREIGN KEY (ID_Checklist) REFERENCES Checklist_Diario(ID_Checklist),
    FOREIGN KEY (ID_Socorrista_Solicitante) REFERENCES Usuario(ID_Usuario),
    FOREIGN KEY (ID_Farmacia_Responsavel) REFERENCES Usuario(ID_Usuario)
);

-- Tabela para detalhar os itens de cada pedido de reposição
CREATE TABLE Itens_Pedido (
    ID_Itens_Pedido INT PRIMARY KEY AUTO_INCREMENT,
    ID_Pedido INT,
    ID_Insumo INT,
    Quantidade_Solicitada INT NOT NULL,
    Quantidade_Entregue INT,
    FOREIGN KEY (ID_Pedido) REFERENCES Pedido_Reposicao(ID_Pedido),
    FOREIGN KEY (ID_Insumo) REFERENCES Insumo(ID_Insumo)
);