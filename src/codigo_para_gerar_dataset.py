import gzip
import json
import pandas as pd
import re

# 1. Carregar autores

print("Carregando autores...")

autores_dict = {}

with gzip.open(
    "/content/goodreads_book_authors.json.gz",
    "rt",
    encoding="utf-8"
) as f:

    for linha in f:

        try:

            autor = json.loads(linha)

            autores_dict[
                str(autor["author_id"])
            ] = autor.get("name", "")

        except Exception:
            pass

print(f"Autores carregados: {len(autores_dict):,}")

# 2. Arquivos de livros

arquivos = [
    (
        "/content/goodreads_books_fantasy_paranormal.json.gz",
        "Fantasia e Paranormal"
    ),
    (
        "/content/goodreads_books_mystery_thriller_crime.json.gz",
        "Mistério, Thriller e Crime"
    ),
    (
        "/content/goodreads_books_romance.json.gz",
        "Romance"
    )
]

# 3. Extração dos livros

livros = []

for caminho, genero in arquivos:

    print(f"\nLendo {caminho}")

    contador = 0

    with gzip.open(
        caminho,
        "rt",
        encoding="utf-8"
    ) as f:

        for linha in f:

            try:

                livro = json.loads(linha)

                language_code = str(
                livro.get("language_code", "")
                ).lower().strip()

                country_code = str(
                livro.get("country_code", "")
                ).lower().strip()

# Manter apenas livros em português
                if (
                   language_code not in {"por", "pt", "pt-br", "pt_br"}
                   and country_code != "br"
                  ):
                 continue

                # Autor principal

                autor_nome = ""

                autores = livro.get("authors", [])

                if len(autores) > 0:

                    author_id = str(
                        autores[0].get("author_id", "")
                    )

                    autor_nome = autores_dict.get(
                        author_id,
                        ""
                    )

                # Data da publicação

                ano = livro.get(
                    "publication_year",
                    ""
                )

                # Sinopse e imagem

                sinopse = livro.get("description", "")

                # Remover HTML
                sinopse = re.sub(r"<[^>]+>", " ", sinopse)

                # Remover quebras de linha
                sinopse = sinopse.replace("\n", " ")
                sinopse = sinopse.replace("\r", " ")

                # Remover múltiplos espaços
                sinopse = re.sub(r"\s+", " ", sinopse).strip()

                imagem = livro.get("image_url", "")

                # Livro

                livros.append({
                    "id_livro":
                        livro.get("book_id"),

                    "nome":
                        livro.get("title", ""),

                    "autor":
                        autor_nome,

                    "genero":
                        genero,

                    "ano_publicacao":
                        ano,

                    "descricao":
                        sinopse,

                    "imagem":
                        imagem
                })

                contador += 1

            except Exception:
                pass

    print(f"Livros processados: {contador:,}")

# 4. Dataframe

df = pd.DataFrame(livros)

# Remover títulos vazios
df = df[df["nome"].notna()]
df = df[df["nome"].str.strip() != ""]

# Remover duplicatas
df = df.drop_duplicates(
    subset=["nome", "autor"]
)

# 5. Salvar

saida = "/content/dataset_livros.csv"

df.to_csv(
    saida,
    index=False,
    encoding="utf-8-sig"
)

print("Arquivo gerado")
print(f"Total de livros: {len(df):,}")
print(f"Arquivo: {saida}")

print("\nAmostra:")
print(df.head())
