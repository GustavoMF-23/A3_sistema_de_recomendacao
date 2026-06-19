import { useState } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { BookDetail } from './pages/BookDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Cart } from './pages/Cart'
import { Preferences } from './pages/Preferences'

type Page = 'home' | 'book-detail' | 'login' | 'register' | 'cart' | 'preferences';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentParams, setCurrentParams] = useState<any>(null);

  const navigate = (page: Page, params?: any) => {
    setCurrentPage(page);
    if (params) {
      setCurrentParams(params);
    } else {
      setCurrentParams(null);
    }
    // Rola para o topo da página na navegação
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={(page, params) => navigate(page as Page, params)} />;
      case 'book-detail':
        return <BookDetail bookId={currentParams?.id} onNavigate={(page, params) => navigate(page as Page, params)} />;
      case 'login':
        return <Login onNavigate={(page) => navigate(page as Page)} />;
      case 'register':
        return <Register onNavigate={(page) => navigate(page as Page)} />;
      case 'cart':
        return <Cart onNavigate={(page, params) => navigate(page as Page, params)} />;
      case 'preferences':
        return <Preferences onNavigate={(page) => navigate(page as Page)} />;
      default:
        return <Home onNavigate={(page, params) => navigate(page as Page, params)} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Barra de Navegação */}
      <Navbar onNavigate={(page, params) => navigate(page as Page, params)} currentPage={currentPage} />

      {/* Conteúdo Dinâmico */}
      <main style={{ flexGrow: 1 }}>
        {renderPage()}
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}

export default App

