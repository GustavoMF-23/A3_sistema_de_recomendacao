#  Livraria Greena-Leitura & Sistema de Recomendação

Este projeto consiste em um **Sistema de Recomendação de Livros** integrado a uma loja virtual (e-commerce) responsiva com design futurista e tecnológico, desenvolvido como atividade acadêmica (A3).

A aplicação foi estruturada sob uma arquitetura moderna dividida em duas camadas (Backend e Frontend), empacotada em containers Docker e orquestrada via Docker Compose para facilitar a execução, reprodução e avaliação do sistema.

---

##  Tecnologias Utilizadas

### **Backend**
*   **Python 3.11** + **FastAPI**: Desenvolvimento de rotas assíncronas de alta performance com documentação Swagger interativa gerada automaticamente.
*   **SQLAlchemy** + **SQLite**: Banco de dados relacional leve para persistência de dados de usuários, itens do carrinho de compras, preferências de gêneros e histórico de interações (cliques).
*   **Scikit-Learn** + **Pandas** + **NumPy**: Biblioteca para processamento dos metadados dos livros, vetorização e cálculo de similaridade vetorial.
*   **Pytest**: Framework para a automação de testes unitários e de integração.
*   **JWT (JSON Web Tokens)**: Padrão para autenticação segura e controle de sessões dos usuários.

### **Frontend**
*   **React 19** + **TypeScript** + **Vite**: Framework moderno e tipado para a construção de uma Single Page Application (SPA) veloz e reativa.
*   **CSS Dinâmico (Variáveis customizadas)**: Design system próprio sem a necessidade de bibliotecas externas pesadas, permitindo transições suaves e responsividade total.
*   **Lucide React**: Biblioteca de ícones modernos integrados à interface.

---

##  Principais Recursos e Funcionalidades

O sistema foi planejado e implementado com os seguintes recursos principais:

1.  **Autenticação e Sessão Segura**: Fluxo de cadastro e login de usuários com senhas criptografadas via algoritmo bcrypt e persistência do estado da sessão utilizando tokens JWT no cabeçalho de requisições.
2.  **Painel de Preferências de Leitura**: Tela que permite a calibração do recomendador através da seleção de gêneros literários favoritos do usuário.
3.  **Carrinho de Compras Híbrido**: Itens adicionados ao carrinho antes do login são persistidos no `localStorage` do navegador e, após o login ou cadastro bem-sucedidos, são automaticamente migrados e sincronizados com a tabela do banco de dados SQLite.
4.  **Catálogo Geral com Paginação e Busca**: Filtro de pesquisa de livros em tempo real por nome ou autor e filtragem de categorias por chips de gênero selecionáveis.
5.  **Motor de Recomendação Híbrido**:
    *   **Filtragem Baseada em Conteúdo (Content-Based Filtering)**: Processamento de texto contendo o nome do livro, o autor, os gêneros e a sinopse.
    *   **Recomendações por Histórico de Cliques (Estilo Amazon)**: Rastreamento em tempo real das visualizações de cada livro. O sistema armazena cliques e gera dinamicamente seções intituladas *"Porque você viu [Livro]"*, sugerindo títulos matematicamente similares com base no vetor TF-IDF.
    *   **Calibração por Gêneros**: Boost direto no score de similaridade para livros que coincidem com os interesses configurados nas preferências do usuário.
6.  **Interface Responsiva com Tema Dual**: Alternância entre Modo Claro (estilo moderno e limpo) e Modo Escuro (visual tecnológico cyberpunk de alto contraste) adaptado para dispositivos móveis, tablets e monitores de alta resolução.
7.  **Capas Dinâmicas**: Algoritmo no frontend que gera capas de livros estilizadas via CSS e gradientes dinâmicos quando a URL de imagem padrão fornecida pelo dataset é inválida ou inacessível.

---

##  Estrutura do Repositório

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

##  Detalhes do Algoritmo de Recomendação

O motor de recomendação adota representações textuais dos livros integradas a cálculos de distância matemática.

### Lógica de Vetorização (Treinamento)
1.  Os livros do arquivo `dataset_livros.csv` são carregados no banco de dados SQLite.
2.  É formada uma string unificada combinando os metadados do livro. Para priorizar termos mais específicos de busca em relação ao texto descritivo geral, aplica-se uma repetição de termos: o nome do livro e seu gênero são multiplicados por 3 vezes e o autor por 2 vezes.
3.  O `TfidfVectorizer` (configurado com remoção de *stop words* em português) calcula a frequência de cada termo em relação ao acervo, convertendo os livros em uma matriz esparsa de vetores numéricos.

### Lógica de Similaridade de Cosseno (Cálculo)
*   **Interesses do Carrinho**: Ao analisar os livros no carrinho do usuário, o motor calcula um vetor médio de interesse de compra. A similaridade de cosseno é calculada contra todos os outros livros disponíveis no banco.
*   **Preferências do Perfil**: Se o usuário escolheu gêneros preferidos, esses termos são vetorizados e adicionam um peso de `+0.5` na pontuação de similaridade final, além de um *boost* direto de `+0.2` para correspondências exatas.
*   **Histórico de Visualização**: Cada clique nos detalhes de um livro gera um registro de visualização. Para cada uma das últimas visualizações do usuário, o motor calcula a recomendação de cosseno individualizada daquele item fonte, retornando seções dinâmicas agrupadas por livro na página inicial.
*   **Prevenção de Duplicidades**: Itens atualmente no carrinho ou que já foram visualizados/recomendados em seções anteriores são temporariamente penalizados com score `-1.0` para evitar repetições indesejadas.

---

##  Como Executar a Aplicação

### **Método Recomendado (Docker Compose)**

Requisitos: Ter o **Docker** e o **Docker Desktop** instalados e em execução.

1.  Basta clicar duas vezes no script `run.bat` (no Windows) ou executar `./run.sh` no terminal (em Linux/macOS).
    *   *Ou execute o comando manualmente na pasta raiz:*
        ```bash
        docker compose up --build
        ```
2.  Aguarde a inicialização dos serviços. Na primeira execução, o banco SQLite de livros será populado automaticamente a partir do arquivo CSV.
3.  Acesse pelos links:
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
2.  Crie e ative um ambiente virtual:
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
    *O Backend estará escutando na porta `8000` (http://localhost:8000)*

#### **Passo 2: Frontend**
Requisitos: Node.js 18+
1.  Abra um novo terminal na pasta `frontend/`:
    ```bash
    cd frontend
    ```
2.  Instale os pacotes npm:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    *O Frontend estará rodando por padrão em `http://localhost:5173`*

---

##  Executando os Testes Automatizados

Foram desenvolvidos testes automatizados na pasta `backend/tests/` para validar a estabilidade dos endpoints da API, a autenticação JWT, a manipulação do carrinho de compras e o comportamento do recomendador TF-IDF.

Para executá-los:
1.  Com o ambiente virtual do backend ativado (`venv`), execute:
    ```bash
    pip install pytest httpx
    ```
2.  Rode os testes com o comando:
    ```bash
    pytest
    ```
3.  O resultado dos testes será exibido diretamente no console.
