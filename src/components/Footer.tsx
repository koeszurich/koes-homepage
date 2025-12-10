
import { Instagram, MessageSquare, Mail } from 'lucide-react';
import { useWhatsApp } from './WhatsAppProvider';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { openWhatsApp } = useWhatsApp();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">KÖS Zürich</h3>
            <p className="text-gray-300 mb-6">
              Klub der Österreichischen Studierenden Zürich
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/koes.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-koes-red transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <button
                onClick={openWhatsApp}
                className="text-gray-300 hover:text-koes-red transition-colors"
                aria-label="WhatsApp"
              >
                <MessageSquare size={24} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Kontakt</h3>
            <a
              href="mailto:info@koes.ch"
              className="flex items-center text-gray-300 hover:text-koes-red transition-colors mb-3"
            >
              <Mail size={18} className="mr-2" />
              <span>info@koes.ch</span>
            </a>
            <button
              onClick={openWhatsApp}
              className="flex items-center text-gray-300 hover:text-koes-red transition-colors mb-3"
            >
              <MessageSquare size={18} className="mr-2" />
              <span>WhatsApp beitreten</span>
            </button>
          </div>

          {/* <div>
            <h3 className="text-xl font-bold mb-4 text-white">Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-koes-red transition-colors flex items-center"
                >
                  <ExternalLink size={16} className="mr-2" />
                  <span>Impressum</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-koes-red transition-colors flex items-center"
                >
                  <ExternalLink size={16} className="mr-2" />
                  <span>Datenschutz</span>
                </a>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p>© {currentYear} Klub der Österreichischen Studierenden Zürich</p>
          <div className="flex justify-center gap-4">
            <div className="footer-logo h-20">
              <a href="https://vseth.ethz.ch/" target="_blank">
                <img src="/logos/vseth-invers.svg" alt="VSETH"/>
              </a>
            </div>
            <div className="footer-logo h-20">
              <a href="https://www.vsuzh.ch/" target="_blank">
                <img src="/logos/vsuzh-invers.svg" alt="VSUZH"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
