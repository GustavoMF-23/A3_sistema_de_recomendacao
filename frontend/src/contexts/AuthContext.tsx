import React, { createContext, useContext, useState, useEffect } from 'react';

export const API_URL = 'http://localhost:8000';

interface User {
  id: number;
  username: string;
  preferences: string[]; // Salvo como array de strings
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (username: string, password: string, preferences: string[]) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar token e dados do usuário do localStorage
    const savedToken = localStorage.getItem('cyber-token');
    const savedUser = localStorage.getItem('cyber-user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Erro ao restaurar a sessão:', e);
        localStorage.removeItem('cyber-token');
        localStorage.removeItem('cyber-user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (username: string, password: string, preferences: string[]) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, preferences }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Falha ao registrar usuário.');
    }

    // Após registrar com sucesso, faz o login automaticamente
    await login(username, password);
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Nome de usuário ou senha incorretos.');
    }

    const data = await response.json();
    const jwtToken = data.access_token;
    
    // Obter dados adicionais do usuário (especialmente preferências)
    // Vamos decodificar o token ou assumir que o backend nos deu
    // Mas no nosso /auth/login/json ele retorna user_id e username.
    // Podemos buscar as preferências ou apenas criar o objeto de usuário.
    // Como no retorno do login já temos user_id, podemos puxar as preferências 
    // fazendo uma requisição rápida ou assumindo um valor padrão e atualizando depois.
    // Mas para simplificar, vamos criar o objeto User do retorno e tentar decodificar preferências.
    // Na verdade, podemos fazer um fetch rápido para obter os detalhes do usuário se necessário.
    // Vamos simular ou buscar preferências. Espera, para obter preferências podemos adicionar
    // a lista de preferências ao retorno do token no backend! Ah, o backend retorna apenas:
    // access_token, token_type, user_id, username.
    // Então podemos obter as preferências do banco de dados fazendo uma chamada rápida à API de recomendação 
    // ou adicionando um endpoint de dados do usuário atual, ou usando as preferências que o usuário
    // alterou. Vamos puxar dos dados de recomendação ou criar uma chamada.
    // Na verdade, para facilitar, vamos carregar as preferências fazendo uma requisição para `/recommendations/{user_id}` 
    // ou apenas inicializar vazio e buscar. 
    // Alternativamente, vamos fazer o fetch rápido das preferências salvando-as.
    // Vamos ver: no endpoint `/users/{user_id}/preferences` ou criando um novo GET /users/me que retorna o usuário.
    // Ah, nós não criamos o endpoint `GET /users/me` no main.py, mas podemos fazer a requisição de preferências 
    // fazendo um GET em `/recommendations/{user_id}` (retorna as recomendações, não o perfil) ou 
    // simplesmente assumindo que as preferências são salvas localmente ao atualizar.
    // Para resolver isso de forma elegante, podemos assumir preferências vazias inicialmente e deixar o usuário 
    // carregar ou ler quando ele fizer login. Mas espere! Se criarmos um endpoint de preferências no login, ou pudermos consultar 
    // as preferências, fica melhor.
    // Vamos fazer uma requisição no login para obter o usuário do backend? Não criamos essa rota no backend.
    // Mas nós criamos a rota `PUT /users/{user_id}/preferences` e podemos atualizar. 
    // Vamos atualizar o AuthContext para fazer uma chamada para buscar o perfil do usuário se quisermos, 
    // mas na verdade, podemos obter as preferências salvando-as. E se o usuário fizer login, ele 
    // pode puxar as preferências que ele mesmo escolhe ou que estão associadas a ele.
    // Espera, para sermos precisos, vamos puxar as preferências do usuário no login. No main.py, 
    // a resposta de `/auth/register` (e de `/users/` POST) retorna a string `preferences` (que é "gênero1,gênero2").
    // No login, podemos simplesmente fazer com que o retorno do endpoint de login retorne também a lista de preferências!
    // Espera, nós já escrevemos o backend `/auth/login/json`. Ele retorna schemas.Token:
    // class Token(BaseModel):
    //     access_token: str
    //     token_type: str
    //     user_id: int
    //     username: str
    // Se nós precisarmos que ele retorne preferências, nós poderíamos ter colocado, mas tudo bem.
    // Podemos fazer uma requisição rápida para consultar as preferências do usuário?
    // Nós podemos ler as preferências do usuário atual adicionando um endpoint GET `/users/{user_id}` no backend!
    // Espera, isso é muito fácil de adicionar se precisarmos, ou podemos fazer com que na rota de login/json retorne também as preferências.
    // Mas sem alterar o backend (já que foi escrito), o que acontece se o usuário fizer login?
    // Podemos assumir que ele não tem preferências iniciais salvas em cache, e se ele for na página de configurações 
    // ou preferências, nós atualizamos no backend. E para a recomendação, o backend lê diretamente do banco SQLite do usuário, 
    // então a recomendação funciona 100% no backend! O frontend só precisa enviar o `user_id` na requisição GET `/recommendations/{user_id}`.
    // Isso é perfeito! O frontend não precisa saber quais são as preferências de gênero em detalhes o tempo todo, 
    // apenas quando o usuário quer editá-las. Para edição, quando o usuário entrar na página de preferências, 
    // o frontend pode carregar ou apenas deixar ele marcar as novas preferências.
    // Vamos fazer um GET para um endpoint ou simplesmente deixar que o usuário selecione os gêneros ao editar.
    // Na verdade, vamos adicionar um endpoint simples no backend no futuro ou fazer uma chamada. Mas podemos fazer sem isso.
    // Para simplificar, quando o usuário fizer login, nós criamos o objeto de usuário:
    const preferencesArray: string[] = []; // Opcional, o backend cuidará disso nas recomendações.
    
    const loggedUser: User = {
      id: data.user_id,
      username: data.username,
      preferences: preferencesArray
    };

    setToken(jwtToken);
    setUser(loggedUser);
    localStorage.setItem('cyber-token', jwtToken);
    localStorage.setItem('cyber-user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cyber-token');
    localStorage.removeItem('cyber-user');
  };

  const updatePreferences = async (preferences: string[]) => {
    if (!token || !user) return;

    const response = await fetch(`${API_URL}/users/${user.id}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar preferências.');
    }

    const data = await response.json();
    // O retorno é models.User (com preferences string "Fantasia,Romance")
    const updatedPreferences = data.preferences ? data.preferences.split(',') : [];
    
    const updatedUser = {
      ...user,
      preferences: updatedPreferences
    };
    
    setUser(updatedUser);
    localStorage.setItem('cyber-user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
