# 🚑 E-MedLog: Gestão de Insumos para Ambulâncias

> Agilidade na Linha de Frente da Saúde: Sistema Web (PWA) para Gerenciamento de Insumos em Ambulâncias de UPAs.

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Licença](https://img.shields.io/badge/license-MIT-blue)

## 📖 Sobre o Projeto

[cite_start]O **E-MedLog** é um sistema desenvolvido para modernizar e otimizar o fluxo de reposição de materiais médicos em viaturas de emergência[cite: 536].

[cite_start]O projeto substitui o antigo método manual (baseado em formulários de papel) por uma solução digital eficiente que garante rastreabilidade e segurança[cite: 538]. O sistema funciona como um **Progressive Web App (PWA)**, permitindo que socorristas realizem checklists e pedidos diretamente de dispositivos móveis, mesmo em trânsito.

[cite_start]O sistema foi implantado e validado em um ambiente de servidor local utilizando **Raspberry Pi**, demonstrando a viabilidade de uma infraestrutura de baixo custo e alta eficiência para o setor público[cite: 550].

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando uma arquitetura moderna e modular:

### Front-end (Interface)
* [cite_start]**[React](https://reactjs.org/)**: Biblioteca principal para construção da interface[cite: 541].
* **Vite**: Ferramenta de build rápida e otimizada.
* **React Router DOM**: Gerenciamento de rotas e navegação.
* **CSS Modules / Variáveis CSS**: Estilização responsiva e padronizada (Mobile First).

### Back-end (API)
* **[Python](https://www.python.org/)**: Linguagem principal.
* [cite_start]**[Flask](https://flask.palletsprojects.com/)**: Microframework para criação da API RESTful[cite: 541].
* **Flask-Bcrypt**: Para criptografia segura de senhas.
* **Flask-Cors**: Para gerenciamento de segurança cross-origin.

### Banco de Dados
* [cite_start]**[MariaDB](https://mariadb.org/)**: Banco de dados relacional para persistência segura das informações[cite: 541].

### Infraestrutura e Deploy
* [cite_start]**Raspberry Pi 2 Model B**: Servidor de hospedagem[cite: 550].
* [cite_start]**Nginx**: Servidor web e Proxy Reverso[cite: 1044].
* [cite_start]**Gunicorn**: Servidor WSGI para executar a aplicação Python em produção[cite: 1036].
* [cite_start]**Cloudflare Tunnel**: Para acesso remoto seguro via HTTPS[cite: 1045].

---

## ✨ Funcionalidades Principais

### 🚑 Perfil Socorrista
* [cite_start]**Checklist Inteligente:** Lista padronizada de insumos com indicação de quantidade mínima[cite: 1091].
* [cite_start]**Preenchimento Quantitativo:** Informa a quantidade real encontrada na viatura[cite: 549].
* [cite_start]**Pedido Automático:** O sistema calcula a diferença e gera o pedido de reposição automaticamente apenas para os itens em falta[cite: 1093].
* **Histórico:** Visualização dos pedidos anteriores e seus status.

### 💊 Perfil Farmácia
* [cite_start]**Gestão de Pedidos:** Visualização em tempo real de pedidos pendentes[cite: 1095].
* **Atendimento:** Detalhamento dos itens solicitados e marcação de pedidos como "Atendidos".

### 👨‍💼 Perfil Gestor
* **Dashboard Administrativo:** Visão geral do sistema.
* [cite_start]**Gestão de Usuários (CRUD):** Cadastro, edição e inativação de socorristas e farmacêuticos[cite: 1096].
* [cite_start]**Gestão de Insumos (CRUD):** Controle total sobre o catálogo de materiais e estoques mínimos[cite: 1096].
* **Controle de Ambulâncias:** Monitoramento do status das viaturas (Apta/Inapta).

---

## 📸 Screenshots

*(Adicione aqui as imagens das telas finais do seu sistema, como o Dashboard e o Checklist)*

| Login | Dashboard | Checklist |
|:---:|:---:|:---:|
| ![Login](frontend/public/print_login.png) | ![Dashboard](frontend/public/print_dashboard.png) | ![Checklist](frontend/public/print_checklist.png) |

---

## 🚀 Como Executar Localmente

Para rodar o projeto na sua máquina para desenvolvimento:

### Pré-requisitos
* Node.js e npm instalados.
* Python 3.x instalado.
* MySQL ou MariaDB rodando localmente.

### 1. Configuração do Back-end

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/emedlog.git](https://github.com/seu-usuario/emedlog.git)
cd emedlog/backend

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate  # (Ou .\venv\Scripts\activate no Windows)

# Instale as dependências
pip install -r requirements.txt

# Configure o banco de dados
# (Certifique-se de criar um banco 'emlog_db' no seu MySQL local antes)
mysql -u root -p < schema.sql

# Execute o script de seed (opcional, para criar usuários iniciais)
python seed.py

# Inicie o servidor
python run.py
