# Usar imagem oficial do Python leve
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias para compilação (se scikit-learn/pandas exigirem)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivo de dependências
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código-fonte da aplicação
COPY ./app ./app

# Expor a porta que o Uvicorn usará
EXPOSE 8000

# Executar a aplicação com Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
