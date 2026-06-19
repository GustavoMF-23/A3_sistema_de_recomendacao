import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_URL } from './AuthContext';

export interface Book {
  id: string;
  nome: string;
  autor: string;
  genero: string;
  ano_publicacao: number;
  descricao: string;
  imagem: string;
}

export interface CartItem {
  id: number; // ID do item no banco ou timestamp para local
  book: Book;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loadingCart: boolean;
  addToCart: (book: Book, quantity: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getBookPrice: (bookId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Calcula o preço simulado para o livro a partir do seu ID para manter consistência
export const getBookPrice = (bookId: string): number => {
  const num = parseInt(bookId) || 42;
  const hash = (num * 17) % 70; // Variação de R$ 0 a R$ 69
  return Math.round((29.90 + hash) * 100) / 100; // Mínimo de R$ 29.90
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);

  // Carregar carrinho local ou remoto
  useEffect(() => {
    const fetchCart = async () => {
      if (user && token) {
        setLoadingCart(true);
        try {
          const response = await fetch(`${API_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.ok ? await response.json() : [];
            setCartItems(data);
          }
        } catch (e) {
          console.error('Erro ao carregar carrinho do servidor:', e);
        } finally {
          setLoadingCart(false);
        }
      } else {
        // Usuário deslogado: carregar do localStorage
        const localCart = localStorage.getItem('cyber-cart');
        if (localCart) {
          try {
            setCartItems(JSON.parse(localCart));
          } catch {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    };

    fetchCart();
  }, [user, token]);

  // Sincronizar carrinho local com o servidor quando logar
  useEffect(() => {
    const syncLocalCartToServer = async () => {
      if (user && token) {
        const localCartStr = localStorage.getItem('cyber-cart');
        if (localCartStr) {
          try {
            const localItems: CartItem[] = JSON.parse(localCartStr);
            if (localItems.length > 0) {
              setLoadingCart(true);
              // Adiciona todos os itens locais ao servidor
              for (const item of localItems) {
                await fetch(`${API_URL}/cart`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    book_id: item.book.id,
                    quantity: item.quantity
                  })
                });
              }
              // Limpa o carrinho local
              localStorage.removeItem('cyber-cart');
              
              // Recarrega o carrinho consolidado do servidor
              const response = await fetch(`${API_URL}/cart`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (response.ok) {
                const data = await response.json();
                setCartItems(data);
              }
            }
          } catch (e) {
            console.error('Erro ao sincronizar carrinho local com servidor:', e);
          } finally {
            setLoadingCart(false);
          }
        }
      }
    };

    syncLocalCartToServer();
  }, [user, token]);

  // Persistir carrinho local no localStorage se deslogado
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cyber-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (book: Book, quantity: number) => {
    if (user && token) {
      try {
        const response = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            book_id: book.id,
            quantity: quantity
          })
        });

        if (response.ok) {
          // Atualiza a lista buscando o carrinho atualizado do backend
          const cartRes = await fetch(`${API_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (cartRes.ok) {
            const data = await cartRes.json();
            setCartItems(data);
          }
        }
      } catch (e) {
        console.error('Erro ao adicionar item ao carrinho no servidor:', e);
      }
    } else {
      // Offline / Deslogado
      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.book.id === book.id);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity = quantity;
          return updated;
        } else {
          return [...prev, { id: Date.now(), book, quantity }];
        }
      });
    }
  };

  const removeFromCart = async (bookId: string) => {
    if (user && token) {
      try {
        const response = await fetch(`${API_URL}/cart/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
        }
      } catch (e) {
        console.error('Erro ao remover item do carrinho no servidor:', e);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
    }
  };

  const clearCart = async () => {
    if (user && token) {
      try {
        const response = await fetch(`${API_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCartItems([]);
        }
      } catch (e) {
        console.error('Erro ao limpar carrinho no servidor:', e);
      }
    } else {
      setCartItems([]);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (getBookPrice(item.book.id) * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loadingCart,
        addToCart,
        removeFromCart,
        clearCart,
        getBookPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
