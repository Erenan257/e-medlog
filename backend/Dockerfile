# 1. Usa uma versão oficial e super leve do Python
FROM python:3.10-slim

# 2. Cria uma pasta chamada /app dentro do container
WORKDIR /app

# 3. Copia a sua lista de dependências para dentro do container
COPY requirements.txt .

# 4. Instala as dependências do projeto e o Gunicorn (Servidor de Produção)
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# 5. Copia todo o restante do seu código (as rotas, o run.py, etc.) para o container
COPY . .

# 6. Informa que o container vai comunicar através da porta 5000
EXPOSE 5000

# 7. A Mágica de Produção: Liga o sistema usando o Gunicorn em vez do Flask de testes
# O "--workers 3" cria 3 cópias do seu backend rodando simultaneamente para aguentar muito tráfego!
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "run:app"]