import { Instagram, MessageSquare } from 'lucide-react';
import { useWhatsApp } from './WhatsAppProvider';

const Hero = () => {
  const { openWhatsApp } = useWhatsApp();

  return (
    <section
      id="home"
      className="min-h-screen pt-24 pb-16 flex items-center section-padding relative bg-cover bg-center"
      style={{ backgroundImage: "url('/hero/zuerich2.jpg')" }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Klub der Österreichischen Studierenden Zürich
          </h1>

          <p className="text-xl text-white mb-10 max-w-3xl mx-auto">
            Wir sind eine Plattform für Austausch, Events und Zusammenhalt unter österreichischen Studierenden in Zürich.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScgASyO9v7PT4OPhH5f8_OFbErcEm4QLyZfX-Iee6jTl4q3TA/viewform?usp=sf_link"
              className="cta-button-primary flex items-center justify-center font-bold"
            >
              Mitglied werden
            </a>
            <button
              onClick={openWhatsApp}
              className="cta-button-secondary flex items-center justify-center hover:bg-[#00e676] hover:border-[#00e676] font-bold"
              style={{ backgroundColor: '#00e676', borderColor: '#00e676', color: 'white' }}
            >
              <MessageSquare size={18} className="mr-2" />
              WhatsApp beitreten
            </button>
          </div>

          <div className="flex justify-center space-x-6">
            <a
              href="https://www.instagram.com/koes.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-white hover:text-koes-red transition-colors"
            >
              <Instagram size={28} className="mb-2" />
              <span className="text-sm">Instagram</span>
            </a>
            <button
              onClick={openWhatsApp}
              className="flex flex-col items-center text-white hover:text-koes-red transition-colors"
            >
              <MessageSquare size={28} className="mb-2" />
              <span className="text-sm">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
