# 📚 Livraria Greena-Leitura & Sistema de Recomendação

Este é o meu projeto de **Sistema de Recomendação de Livros** integrado a uma loja virtual (e-commerce) responsiva com design futurista e tecnológico, desenvolvido como atividade acadêmica (A3). 

Desenvolvi o sistema sob uma arquitetura moderna de duas camadas (Backend e Frontend), empacotado sob containers Docker e orquestrado via Docker Compose para facilitar a reprodução, teste e avaliação do projeto.

---

## 🛠️ Tecnologias que Utilizei

### **Backend**
*   **Python 3.11** + **FastAPI**: Criação rápida de APIs com documentação Swagger automática.
*   **SQLAlchemy** + **SQLite**: Banco de dados relacional leve para persistir contas de usuários, itens do carrinho de compras, interações (cliques/visualizações) e metadados de livros.
*   **Scikit-Learn** + **Pandas** + **NumPy**: Análise de dados, vetorização TF-IDF e cálculo matemático de similaridade de cosseno.
*   **Pytest**: Suite de testes automatizados para rotas de negócio e inteligência artificial.
*   **JWT (JSON Web Tokens)**: Segurança na persistência e autenticação de usuários logados.

### **Frontend**
*   **React 19** + **TypeScript** + **Vite**: Construção de interface de usuário estritamente tipada, veloz e componentizada.
*   **CSS Dinâmico (Variáveis customizadas)**: Design system customizado para modo Claro e Escuro (Futurista / Cyberpunk) sem dependências externas pesadas (como TailwindCSS), mantendo o código leve e com controle total.
*   **Lucide React**: Ícones de alta qualidade para os elementos visuais.

---

## 📐 Estrutura do Meu Repositório

```text
provatrabalho3/
├── backend/
│   ├── app/
│   │   ├── auth.py          # Autenticação, senhas e geração de tokens JWT
│   │   ├── database.py      # Conexão e sessão do banco de dados SQLite
│   │   ├── main.py          # Rotas FastAPI e inicialização do banco
│   │   ├── models.py        # Modelos relacionais (SQLAlchemy)
│   │   ├── recommender.py   # Lógica do Motor de Recomendação (TF-IDF)
│   │   └── schemas.py       # Validações de entrada/saída (Pydantic)
│   ├── tests/
│   │   └── test_api.py      # Testes automatizados (Pytest)
│   ├── Dockerfile           # Dockerfile para containerizar o Backend
│   └── requirements.txt     # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes visuais (Navbar, Footer, BookCard)
│   │   ├── contexts/        # Contextos globais (Auth, Theme, Cart)
│   │   ├── pages/           # Telas (Home, BookDetail, Login, Register, Cart, Preferences)
│   │   ├── App.css
│   │   ├── App.tsx          # Controlador de Rotas SPA
│   │   ├── index.css        # Design System e temas de cores
│   │   └── main.tsx
│   ├── Dockerfile           # Dockerfile multi-stage com Nginx para Produção
│   └── package.json
├── dataset_livros.csv       # Dataset contendo 6.193 exemplares de livros
├── docker-compose.yml       # Orquestrador de múltiplos serviços
├── run.bat                  # Script de inicialização facilitada no Windows
├── run.sh                   # Script de inicialização facilitada no Unix
└── README.md                # Documentação técnica do projeto (esta que você está lendo)
```

---

## 🤖 Como Desenvolvi o Motor de Recomendação (Lógica e Modelo)

Para atender à proposta da atividade acadêmica de construir um sistema de recomendação real, adotei a técnica de **Filtragem Baseada em Conteúdo (Content-Based Filtering)** combinada com os **interesses em tempo real** do usuário, utilizando análise de texto sobre o arquivo `dataset_livros.csv` (contendo mais de 6.000 livros).

### 1. Lógica de Processamento e Treinamento do Modelo
*   Na inicialização do FastAPI, os livros do arquivo CSV são importados e persistidos no banco de dados SQLite (se ele estiver vazio).
*   Para criar um perfil textual rico para cada livro, concateno as colunas textuais (`nome`, `autor`, `genero` e `descricao`).
*   Para garantir que o autor, o nome do livro e o gênero pesem mais do que as palavras soltas da sinopse, apliquei uma técnica de **repetição de termos importantes** (multiplico o título e gênero por 3 vezes e o autor por 2 vezes no texto final de treinamento).
*   Utilizo o `TfidfVectorizer` do `scikit-learn` para ajustar e transformar os textos compilados em vetores de pesos numéricos de termos (Matriz TF-IDF).

### 2. Recomendação Personalizada com Base no Perfil e Interesses (`/recommendations/{user_id}`)
Quando o usuário está autenticado e o sistema exibe os livros recomendados, a minha lógica realiza o seguinte cálculo dinâmico:
*   **Vetor do Carrinho**: Extraio os livros no carrinho do usuário. Se houver itens, calculo o vetor TF-IDF médio deles para representar o perfil de interesses de compra daquele leitor. Aplico a **similaridade de cosseno** entre esse perfil médio e o restante da base de dados.
*   **Preferências de Gênero**: Se o usuário escolheu gêneros preferidos nas suas configurações de perfil, vetorizo esses gêneros e acrescento à pontuação, aplicando também um *boost* direto de `+0.2` na pontuação de similaridade para livros do mesmo gênero.
*   **Filtragem de Repetição**: O motor penaliza e remove da lista livros que já estão no carrinho para evitar recomendações redundantes.
*   **Fallback**: Se o usuário for novo e não tiver dados de carrinho ou gênero, o recomendador sugere uma seleção padrão de livros variados.

### 3. Recomendações Baseadas em Cliques e Navegação - Estilo Amazon (`/recommendations/{user_id}/browsing-history`)
Para enriquecer a experiência, adicionei um sistema de recomendação dinâmico baseado no histórico de cliques do leitor:
*   **Rastreamento de Interações**: Sempre que o usuário clica para ver os detalhes de um livro específico (`BookDetail`), o sistema grava uma interação do tipo `view` no banco de dados.
*   **Geração de Seções Dinâmicas**: O sistema analisa as últimas visualizações do usuário. Para cada um dos livros vistos recentemente, calculo a similaridade de cosseno individual contra toda a base de dados.
*   **Renderização Separada**: A página inicial renderiza seções exclusivas com títulos dinâmicos como *"Porque você viu [Nome do Livro]"*, listando títulos extremamente parecidos com o livro clicado.
*   **Controle de Repetição**: Apliquei uma restrição de conjunto (`set`) para que livros exibidos em uma seção de histórico não se repitam nas outras seções inferiores ou no carrinho.

---

## 🎨 Minhas Decisões de Design (Interface Futurista)

Busquei criar uma interface muito polida, limpa e envolvente. Minhas decisões de design focaram em:
1.  **Glassmorphism**: Aplicação de fundos translúcidos com efeito de desfoque sutil (`backdrop-filter: blur()`) e bordas brilhantes finas, dando um ar tecnológico.
2.  **Modo Escuro (Cyberpunk/Dark)**: Combina um tom azul escuro profundo (`#060913`) com detalhes vibrantes em **Verde Neon** (`#00ff9d`) com efeitos de brilho elétrico (`box-shadow`).
3.  **Modo Claro**: Oferece um contraste limpo em tons branco-gelo com destaques em **Verde Esmeralda** profundo (`#059669`).
4.  **Capas Dinâmicas de Fallback**: Caso o livro importado do dataset não possua uma imagem válida cadastrada, criei capas temáticas renderizadas 100% via CSS com grids digitais e o título formatado para manter a estética do site consistente.
5.  **Carrinho Persistente e Unificado**: O carrinho funciona localmente (`localStorage`) para usuários visitantes e, no momento em que realizam login ou criam conta, os itens são migrados e persistidos no banco de dados automaticamente.

---

## 🚀 Como Executar o Meu Projeto

### **Método Recomendado (Docker Compose)**

Requisitos: Ter o **Docker** e o **Docker Desktop** instalados e em execução.

1.  Dê um duplo clique no arquivo `run.bat` (no Windows) ou execute `./run.sh` no terminal (em Linux/macOS).
    *   *Ou execute o comando manualmente na raiz do projeto:*
        ```bash
        docker compose up --build
        ```
2.  Aguarde a compilação. Na primeira inicialização, o banco SQLite importará o CSV dinamicamente (pode levar 10-15 segundos).
3.  Acesse nos navegadores:
    *   **Frontend (Loja de Livros)**: `http://localhost:3000`
    *   **Backend (Swagger Docs)**: `http://localhost:8000/docs`

---

### **Método Manual (Sem Docker)**

#### **Passo 1: Inicializando o Backend**
Requisitos: Python 3.10+
1.  Entre na pasta `backend/`:
    ```bash
    cd backend
    ```
2.  Crie e ative o ambiente virtual virtualenv:
    ```bash
    python -m venv venv
    # No Windows:
    .\venv\Scripts\activate
    # No Linux/macOS:
    source venv/bin/activate
    ```
3.  Instale os pacotes requeridos:
    ```bash
    pip install -r requirements.txt
    ```
4.  Inicie a API:
    ```bash
    uvicorn app.main:app --reload
    ```
    *A API backend estará rodando em `http://localhost:8000`*

#### **Passo 2: Inicializando o Frontend**
Requisitos: Node.js 18+
1.  Abra outro terminal na pasta `frontend/`:
    ```bash
    cd frontend
    ```
2.  Instale as dependências com NPM:
    ```bash
    npm install
    ```
3.  Inicie o servidor local Vite:
    ```bash
    npm run dev
    ```
    *A interface estará acessível no endereço exibido (geralmente `http://localhost:5173`)*

---

## 🧪 Executando os Meus Testes Automatizados

Escrevi testes unitários e de integração localizados na pasta `backend/tests/test_api.py`. Eles testam a autenticação de usuários, manipulação de itens no banco SQLite em memória e o comportamento matemático de retorno de similaridades do TF-IDF do recomendador.

Para executá-los:
1.  Ative o ambiente virtual do backend (`cd backend` e ative o `venv`).
2.  Instale o pytest (`pip install pytest httpx`).
3.  Execute o comando:
    ```bash
    pytest
    ```
4.  A suite exibirá os testes aprovados de ponta a ponta com sucesso.
