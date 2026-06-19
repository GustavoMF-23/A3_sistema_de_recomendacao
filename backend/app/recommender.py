import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from . import models
import logging

logger = logging.getLogger(__name__)

PORTUGUESE_STOP_WORDS = [
    "a", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo", "as", "ate", "com", "como", 
    "da", "das", "de", "dela", "delas", "dele", "deles", "depois", "do", "dos", "e", "ela", "elas", 
    "ele", "eles", "em", "entre", "era", "eram", "essa", "essas", "esse", "esses", "esta", "estas", 
    "este", "estes", "eu", "foi", "fomos", "foram", "fora", "ha", "haja", "hajam", "houve", "houveram", 
    "isso", "isto", "ja", "lhe", "lhes", "mais", "mas", "me", "mesmo", "meu", "meus", "minha", 
    "minhas", "muito", "na", "nas", "nem", "no", "nos", "nossa", "nossas", "nosso", "nossos", 
    "num", "numa", "o", "os", "ou", "para", "pela", "pelas", "pelo", "pelos", "por", "qual", 
    "quando", "que", "quem", "se", "seja", "sejam", "sem", "ser", "seu", "seus", "so", "sua", 
    "suas", "tambem", "te", "tem", "ter", "teu", "teus", "tu", "tua", "tuas", "um", "uma", "umas", 
    "uns", "vos"
]

class RecommenderSystem:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words=PORTUGUESE_STOP_WORDS, min_df=2)
        self.tfidf_matrix = None
        self.books_df = None
        self.book_id_to_idx = {}
        self.idx_to_book_id = {}


    def fit(self, db: Session):
        """
        Carrega os livros do banco de dados e ajusta o modelo TF-IDF.
        """
        logger.info("Inicializando e ajustando o modelo de recomendação...")
        books = db.query(models.Book).all()
        
        if not books:
            logger.warning("Nenhum livro cadastrado no banco de dados. Pulando treinamento do recomendador.")
            return False

        # Criar DataFrame a partir dos livros do banco
        data = []
        for b in books:
            data.append({
                "id": b.id,
                "nome": b.nome or "",
                "autor": b.autor or "",
                "genero": b.genero or "",
                "descricao": b.descricao or ""
            })
        
        self.books_df = pd.DataFrame(data)
        
        # Combinar metadados para construir uma representação rica do livro
        # Damos pesos diferentes repetindo termos importantes
        def combine_features(row):
            # Repete o nome e autor para dar mais importância a eles do que ao texto da descrição
            nome_repetido = (row['nome'] + " ") * 3
            autor_repetido = (row['autor'] + " ") * 2
            genero_repetido = (row['genero'] + " ") * 3
            return f"{nome_repetido}{autor_repetido}{genero_repetido}{row['descricao']}"

        self.books_df['combined_features'] = self.books_df.apply(combine_features, axis=1)
        
        # Treinar a matriz TF-IDF
        self.tfidf_matrix = self.vectorizer.fit_transform(self.books_df['combined_features'])
        
        # Mapeamentos rápidos para índices
        self.book_id_to_idx = {row['id']: idx for idx, row in self.books_df.iterrows()}
        self.idx_to_book_id = {idx: row['id'] for idx, row in self.books_df.iterrows()}
        
        logger.info(f"Modelo de recomendação ajustado com sucesso para {len(books)} livros.")
        return True

    def get_recommendations(self, db: Session, user: models.User, top_n: int = 6):
        """
        Gera recomendações de livros para um usuário específico.
        Utiliza os itens do carrinho e as preferências de gênero do usuário.
        """
        # Se o modelo não foi treinado ainda, tenta treinar
        if self.tfidf_matrix is None or self.books_df is None:
            success = self.fit(db)
            if not success:
                # Retorna livros populares/recentes como fallback
                return self._get_fallback_recommendations(db, top_n)

        # 1. Obter itens no carrinho do usuário
        cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()
        cart_book_ids = [item.book_id for item in cart_items]
        
        # 2. Obter preferências de gênero
        user_genres = [g.strip() for g in user.preferences.split(",") if g.strip()]

        # Se o usuário não tem carrinho nem preferências de gênero
        if not cart_book_ids and not user_genres:
            return self._get_fallback_recommendations(db, top_n)

        # Matriz final de pontuações de similaridade
        sim_scores = np.zeros(len(self.books_df))

        # --- PARTE A: Similaridade Baseada em Conteúdo do Carrinho ---
        if cart_book_ids:
            cart_indices = []
            for b_id in cart_book_ids:
                if b_id in self.book_id_to_idx:
                    cart_indices.append(self.book_id_to_idx[b_id])
            
            if cart_indices:
                cart_vectors = self.tfidf_matrix[cart_indices]
                user_cart_profile = cart_vectors.mean(axis=0)
                user_cart_profile = np.asarray(user_cart_profile)
                
                cart_sim = cosine_similarity(user_cart_profile, self.tfidf_matrix).flatten()
                sim_scores += cart_sim

        # --- PARTE B: Similaridade Baseada em Preferências de Gênero ---
        if user_genres:
            genre_text = " ".join(user_genres)
            user_genre_vector = self.vectorizer.transform([genre_text])
            genre_sim = cosine_similarity(user_genre_vector, self.tfidf_matrix).flatten()
            sim_scores += genre_sim * 0.5
            
            # Além disso, para livros cujo gênero exato bate, aplicamos um boost direto
            for idx, row in self.books_df.iterrows():
                if any(g.lower() in row['genero'].lower() for g in user_genres):
                    sim_scores[idx] += 0.2

        # 3. Filtrar livros que o usuário já tem no carrinho
        for b_id in cart_book_ids:
            if b_id in self.book_id_to_idx:
                sim_scores[self.book_id_to_idx[b_id]] = -1.0  # Penaliza para não recomendar o que já está no carrinho



        # 4. Obter os top N índices com maiores pontuações
        top_indices = np.argsort(sim_scores)[::-1][:top_n]
        
        recommendations = []
        for idx in top_indices:
            # Ignora os que foram marcados com -1.0
            if sim_scores[idx] <= 0:
                continue
            
            book_id = self.idx_to_book_id[idx]
            book_db = db.query(models.Book).filter(models.Book.id == book_id).first()
            if book_db:
                recommendations.append({
                    "book": book_db,
                    "score": float(sim_scores[idx])
                })

        # Se não obteve recomendações suficientes, preenche com fallbacks
        if len(recommendations) < top_n:
            needed = top_n - len(recommendations)
            existing_ids = {r["book"].id for r in recommendations}
            existing_ids.update(cart_book_ids)
            
            fallbacks = db.query(models.Book).filter(~models.Book.id.in_(existing_ids)).limit(needed).all()
            for b in fallbacks:
                recommendations.append({
                    "book": b,
                    "score": 0.05
                })

        return recommendations[:top_n]

    def _get_fallback_recommendations(self, db: Session, top_n: int = 6):
        """
        Retorna recomendações padrão (por exemplo, os primeiros livros ou alguns livros de gêneros diversos)
        caso não haja dados suficientes do usuário.
        """
        # Apenas pega alguns livros padrão da base
        books = db.query(models.Book).limit(top_n).all()
        return [{"book": b, "score": 0.1} for b in books]

    def get_click_based_recommendations(self, db: Session, user: models.User, top_n: int = 6):
        """
        Mantido para compatibilidade. Delega para get_browsing_recommendations e achata os resultados.
        """
        sections = self.get_browsing_recommendations(db, user, max_sections=2, items_per_section=top_n)
        flat = []
        seen_ids = set()
        for section in sections:
            for rec in section["recommendations"]:
                if rec["book"].id not in seen_ids:
                    flat.append(rec)
                    seen_ids.add(rec["book"].id)
        return flat[:top_n]

    def get_browsing_recommendations(self, db: Session, user: models.User, max_sections: int = 3, items_per_section: int = 6):
        """
        Gera recomendações estilo Amazon: 'Porque você viu [Livro X] → livros similares'.
        Retorna seções agrupadas por livro-fonte, cada uma com livros similares.
        Os livros mais recentemente visualizados geram seções primeiro.
        Não repete recomendações entre seções.
        """
        if self.tfidf_matrix is None or self.books_df is None:
            success = self.fit(db)
            if not success:
                return []

        # Buscar interações do tipo "view" do usuário, ordenadas pela mais recente (ID desc)
        view_interactions = db.query(models.UserInteraction).filter(
            models.UserInteraction.user_id == user.id,
            models.UserInteraction.type == "view"
        ).order_by(models.UserInteraction.id.desc()).limit(100).all()

        if not view_interactions:
            return []

        # Extrair IDs de livros recentes únicos preservando a ordem
        seen_source = set()
        recent_book_ids = []
        for interaction in view_interactions:
            if interaction.book_id not in seen_source:
                seen_source.add(interaction.book_id)
                recent_book_ids.append(interaction.book_id)
            if len(recent_book_ids) >= max_sections:
                break

        # IDs a excluir de todas as recomendações (livros já vistos + carrinho)
        all_viewed_ids = set(seen_source)
        cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()
        cart_ids = {item.book_id for item in cart_items}
        excluded_ids = all_viewed_ids | cart_ids

        # IDs já recomendados em outras seções (evita repetição entre seções)
        already_recommended = set()

        sections = []
        for source_book_id in recent_book_ids:
            if source_book_id not in self.book_id_to_idx:
                continue

            source_book = db.query(models.Book).filter(models.Book.id == source_book_id).first()
            if not source_book:
                continue

            # Calcular similaridade do cosseno deste livro específico vs todos os outros
            source_idx = self.book_id_to_idx[source_book_id]
            sim_scores = cosine_similarity(self.tfidf_matrix[source_idx], self.tfidf_matrix).flatten()

            # Penalizar livros já vistos, no carrinho, ou já recomendados em outra seção
            for exc_id in (excluded_ids | already_recommended):
                if exc_id in self.book_id_to_idx:
                    sim_scores[self.book_id_to_idx[exc_id]] = -1.0

            # Top N mais similares
            top_indices = np.argsort(sim_scores)[::-1][:items_per_section]

            recs = []
            for tidx in top_indices:
                if sim_scores[tidx] <= 0:
                    continue
                rec_book_id = self.idx_to_book_id[tidx]
                rec_book = db.query(models.Book).filter(models.Book.id == rec_book_id).first()
                if rec_book:
                    recs.append({
                        "book": rec_book,
                        "score": float(sim_scores[tidx])
                    })
                    already_recommended.add(rec_book_id)

            if recs:
                sections.append({
                    "source_book": source_book,
                    "recommendations": recs
                })

        return sections

# Instância global do sistema de recomendação (Singleton)
recommender_system = RecommenderSystem()
