import React from 'react';
import { Scissors, User, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2 text-blue-600">
          <Scissors size={24} />
          <span className="font-bold text-lg">BarberShop</span>
        </Link>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link 
                  to="/admin" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Painel Admin
                </Link>
              ) : (
                <Link 
                  to="/client" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Meu Perfil
                </Link>
              )}
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Sair
              </Button>
            </>
          ) : (
            location.pathname !== '/login' && (
              <Button 
                onClick={() => navigate('/login')} 
                variant="primary" 
                size="sm"
              >
                Login
              </Button>
            )
          )}
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-600"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 shadow-md">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors py-2"
              onClick={closeMenu}
            >
              Início
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                    onClick={closeMenu}
                  >
                    Painel Admin
                  </Link>
                ) : (
                  <Link 
                    to="/client" 
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                    onClick={closeMenu}
                  >
                    Meu Perfil
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="text-left text-gray-600 hover:text-blue-600 transition-colors py-2"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                onClick={closeMenu}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};