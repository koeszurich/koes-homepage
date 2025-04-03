
import { Instagram, MessageSquare } from 'lucide-react';

const Hero = () => {
  return (
    <section 
      id="home" 
      className="min-h-screen pt-24 pb-16 flex items-center section-padding relative bg-cover bg-center"
      style={{ backgroundImage: "url('/lovable-uploads/da0a8bea-6b0f-4de6-ab17-f307095cbcb6.png')" }}
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
            <a href="#" className="cta-button-primary flex items-center justify-center">
              Mitglied werden
            </a>
            <a href="#" className="cta-button-secondary flex items-center justify-center">
              <MessageSquare size={18} className="mr-2" />
              WhatsApp beitreten
            </a>
          </div>
          
          <div className="flex justify-center space-x-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center text-white hover:text-koes-red transition-colors"
            >
              <Instagram size={28} className="mb-2" />
              <span className="text-sm">Instagram</span>
            </a>
            <a 
              href="https://whatsapp.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center text-white hover:text-koes-red transition-colors"
            >
              <MessageSquare size={28} className="mb-2" />
              <span className="text-sm">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
