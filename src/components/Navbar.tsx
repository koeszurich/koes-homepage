import { useState, useEffect } from 'react';
import { Menu, X, Instagram, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    // { name: 'Events', href: '#events' },
    { name: 'Vergangene Events', href: '#past-events' },
    { name: 'Vorstand', href: '#team' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Geschichte', href: '#history' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="#home" className="flex items-center">
          <img 
            src="/lovable-uploads/da0a8bea-6b0f-4de6-ab17-f307095cbcb6.png" 
            alt="KÖS Logo" 
            className="h-10 w-auto mr-2" 
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link">
              {link.name}
            </a>
          ))}

          <div className="ml-4 flex items-center space-x-3">
            <a 
              href="https://www.instagram.com/koes.ch/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-koes-red transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://chat.whatsapp.com/LW1Lwhvr3leJDJlDDpSngG" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-koes-red transition-colors"
              aria-label="WhatsApp"
            >
              <MessageSquare size={20} />
            </a>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-koes-dark hover:text-koes-red transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-white pt-16 z-40 animate-fade-in">
          <nav className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-xl font-medium text-koes-dark hover:text-koes-red transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            
            <div className="flex items-center space-x-6 pt-6">
              <a 
                href="https://www.instagram.com/koes.ch/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-koes-red transition-colors flex items-center"
                aria-label="Instagram"
              >
                <Instagram size={24} className="mr-2" />
                <span>Instagram</span>
              </a>
              <a 
                href="https://chat.whatsapp.com/LW1Lwhvr3leJDJlDDpSngG" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-koes-red transition-colors flex items-center"
                aria-label="WhatsApp"
              >
                <MessageSquare size={24} className="mr-2" />
                <span>WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
