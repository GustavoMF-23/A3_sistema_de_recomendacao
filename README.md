# 📚 Livraria Cyber-Leitura & Sistema de Recomendação

Este projeto consiste em um **Sistema de Recomendação de Livros** integrado a uma loja virtual (e-commerce) responsiva com design futurista e tecnológico. 

O sistema foi desenvolvido sob uma arquitetura moderna dividida em duas camadas (Backend e Frontend), empacotado sob containers Docker e orquestrado via Docker Compose para facilitar a reprodução e avaliação.

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
*   **Python 3.11** + **FastAPI**: Criação rápida de APIs com documentação Swagger automática.
*   **SQLAlchemy** + **SQLite**: Banco de dados relacional leve para persistir contas de usuários, itens do carrinho de compras, interações e metadados de livros.
*   **Scikit-Learn** + **Pandas** + **NumPy**: Análise de dados, vetorização TF-IDF e cálculo matemático de similaridade de cosseno.
*   **Pytest**: Suite de testes automatizados para rotas de negócio e inteligência artificial.
*   **JWT (JSON Web Tokens)**: Segurança na persistência e autenticação de usuários logados.

### **Frontend**
*   **React 19** + **TypeScript** + **Vite**: Construção de interface de usuário estritamente tipada, veloz e componentizada.
*   **CSS Dinâmico (Variáveis customizadas)**: Design system customizado para modo Claro e Escuro (Futurista / Cyberpunk) sem dependências externas pesadas (Tailwind).
*   **Lucide React**: Ícones de alta qualidade para elementos visuais.

---

## 📐 Estrutura do Repositório

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
└── README.md                # Documentação técnica do projeto
```

---

## 🤖 O Motor de Recomendação (Lógica e Modelo)

Para atender a proposta da atividade acadêmica e garantir recomendações qualificadas com base no arquivo `dataset_livros.csv` (contendo mais de 6.000 livros), o sistema de recomendação adota a técnica de **Filtragem Baseada em Conteúdo (Content-Based Filtering)** combinada com os **interesses do usuário**.

### Lógica de Treinamento
1. Na inicialização do FastAPI, o dataset `dataset_livros.csv` é lido e persistido no SQLite (se o banco estiver vazio).
2. O sistema de recomendação concatena as colunas textuais (`nome`, `autor`, `genero`, `descricao`) de cada livro para formar uma representação rica em metadados. Para aumentar a relevância do título, autor e gênero em relação à descrição, os termos dessas colunas recebem pesos multiplicados (ex: o título e gênero são repetidos 3 vezes e o autor 2 vezes na string de análise).
3. O `TfidfVectorizer` do `scikit-learn` é ajustado sobre essa string combinada de todos os livros, transformando-os em vetores de pesos numéricos baseados na frequência de termos (TF-IDF Matrix).

### Lógica de Recomendação Personalizada (`/recommendations/{user_id}`)
Quando a API solicita recomendações para um usuário específico, o recomendador atua dinamicamente:
*   **Perfil do Carrinho**: O sistema extrai os livros atualmente no carrinho de compras do usuário. Caso existam itens, calcula o vetor TF-IDF médio deles para representar o perfil de interesses de compra. Com base nesse perfil médio, aplica a **similaridade de cosseno** contra todos os livros da base.
*   **Calibração por Gêneros**: Se o usuário definiu gêneros de preferência no cadastro/perfil (ex: "Ficção Científica", "Romance"), esses gêneros são vetorizados e comparados contra a base. Livros cujos gêneros batem diretamente recebem um "boost" matemático extra de similaridade.
*   **Resultados personalizados**: O motor exclui da lista livros que já estão no carrinho do usuário, ordena as pontuações e retorna os top N livros mais similares.
*   **Fallback Inteligente**: Se o usuário for novo e não possuir preferências ou itens no carrinho, o sistema retorna uma seleção padrão de livros variados.

---

## 🎨 Decisões de Design (Interface Futurista)

Seguindo a solicitação do usuário por um design tecnológico e de visual sério, a UI foi construída sob os seguintes pilares:
1.  **Glassmorphism**: A barra de navegação e os painéis de fundo utilizam a técnica de desfoque sutil (`backdrop-filter: blur()`) com fundo translúcido, transmitindo um visual de ficção científica premium.
2.  **Modo Escuro (Cyberpunk)**: Fundo com azul ultra-profundo (`#060913`), bordas sutis e realces em **Verde Neon** (`#00ff9d`) com efeitos de brilho elétrico (`box-shadow`).
3.  **Modo Claro**: Tons de branco gelo e cinza azulado muito limpos com detalhes em **Verde Esmeralda** profundo (`#059669`).
4.  **Capa Cyber-Fallback**: Quando um livro no catálogo não possui imagem cadastrada (como fotos genéricas de placeholder do dataset), o frontend desenha uma capa temática cyberpunk em CSS puro contendo detalhes de grade digital, título em rajadas brilhantes e gênero em tags estruturadas.
5.  **Responsividade Total**: O site foi estruturado com CSS Grid flexível e media queries estruturadas, garantindo fidelidade perfeita tanto em monitores de PC quanto em telas de celular.
6.  **Carrinho Persistente**: Quando o usuário adiciona itens ao carrinho deslogado, eles são salvos no `localStorage`. Ao efetuar o cadastro ou login, o carrinho é automaticamente migrado e sincronizado com o banco de dados do backend, mantendo o carrinho salvo mesmo se o usuário mudar de dispositivo ou recarregar a aplicação.

---

## 🚀 Como Executar a Aplicação

### **Método Recomendado (Docker Compose)**

Requisitos: Ter o **Docker** e o **Docker Desktop** (no Windows) instalados e em execução.

1.  Dê um duplo clique no script `run.bat` (no Windows) ou execute `./run.sh` no terminal (em Linux/macOS).
    *   *Alternativamente, execute o comando na pasta raiz do projeto:*
        ```bash
        docker compose up --build
        ```
2.  Aguarde o build e a inicialização. Na primeira execução, o banco SQLite de livros será populado dinamicamente com o CSV (pode levar cerca de 10-15 segundos devido ao tamanho do acervo).
3.  Acesse no navegador:
    *   **Frontend (Loja Virtual)**: `http://localhost:3000`
    *   **Backend (Swagger API Docs)**: `http://localhost:8000/docs`

---

### **Método Manual (Sem Docker)**

#### **Passo 1: Backend**
Requisitos: Python 3.10+
1.  Navegue até a pasta `backend/`:
    ```bash
    cd backend
    ```
2.  Crie um ambiente virtual e ative-o:
    ```bash
    python -m venv venv
    # No Windows:
    .\venv\Scripts\activate
    # No Linux/macOS:
    source venv/bin/activate
    ```
3.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
4.  Inicie a API:
    ```bash
    uvicorn app.main:app --reload
    ```
    *(A API estará rodando em `http://localhost:8000`)*

#### **Passo 2: Frontend**
Requisitos: Node.js 18+
1.  Abra um novo terminal e navegue até a pasta `frontend/`:
    ```bash
    cd frontend
    ```
2.  Instale os pacotes necessários:
    ```bash
    npm install
    ```
3.  Execute o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    *(A aplicação estará acessível em `http://localhost:5173` ou na porta exibida pelo Vite)*

---

## 🧪 Como Executar os Testes Automatizados

Os testes de integração e comportamento do recomendador estão localizados na pasta `backend/tests/`. Eles executam rotas de login, criação de itens no catálogo, calibragem de preferências de gênero e verificação de retorno de recomendações do TF-IDF utilizando banco SQLite em memória.

Para executá-los manualmente:
1.  Ative o ambiente virtual do backend (`cd backend` e ative o `venv`).
2.  Instale o pytest caso não esteja disponível (`pip install pytest httpx`).
3.  Rode o comando:
    ```bash
    pytest
    ```
4.  O console listará a aprovação de todos os testes de ponta a ponta.
