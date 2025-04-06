import { Calendar, Image } from 'lucide-react';
import { useState } from 'react';

interface PastEvent {
  title: string;
  date: string;
  description: string;
  image: string;
  gallery?: string[];
}

const PastEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState<PastEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pastEvents: PastEvent[] = [
    {
      title: "Kaiserschmarren und Almdudler",
      date: "27. März 2025",
      description: "Wir haben die offizielle Anerkennung des KÖS gefeiert – mit Kaiserschmarren, Almdudler und vielen neuen Gesichtern.",
      image: "/events/schmarrn-2025/schmarrn_hero.jpeg",
      gallery: [
        "/events/schmarrn-2025/schmarrn_0.jpeg",
      ]
    },
    {
      title: "Semesterauftakt FS25",
      date: "27. Februar 2025",
      description: "Beim Semesterauftakt im Bqm waren wieder viele neue aber auch beteirs bekannt Gesichter dabei. Wir freuen uns sehr neue Mitglieder begrüßen zu dürfen!",
      image: "/events/semester-auftakt-FS25/hero.jpeg",
      gallery: [
        "/events/semester-auftakt-FS25/0.jpeg",
      ]
    },
    {
      title: "Glühweinplausch mit Apfelstrudel",
      date: "12. Dezember 2024",
      description: "Gemütlicher Glühweinplausch zum Jahresausklang auf der LFW-Dachterrasse – mit guter Stimmung und vielen bekannten und neuen Leuten.",
      image: "/events/glühwein-2024/glühwein_0_hero.jpeg",
      gallery: [
        "/events/glühwein-2024/glühwein_0.jpeg",
      ]
    },
    {
      title: "Kös Party im Student-Village",
      date: "21. November 2024",
      description: "Gemütlicher Abend im ETH Student Village zum Kennenlernen, Wiedersehen und Vernetzen mit anderen Studierenden.",
      image: "/events/party-höng-2024/party_höng_hero.jpeg",
      gallery: [
        "/events/party-höng-2024/party_höng_0.jpeg",
        "/events/party-höng-2024/party_höng_1.jpeg",
      ]
    },
    {
      title: "Global Village an der UZH",
      date: "5. November 2024",
      description: "Beim Global Village an der UZH haben wir Österreich mit Manner-Schnitten, Almdudler und guter Laune vertreten.",
      image: "/events/global-village-2024/global_village_0.jpeg",
      gallery: [
        "/events/global-village-2024/global_village_0.jpeg",
        "/events/global-village-2024/global_village_1.jpeg",
      ]
    }
  ];

  return (
    <section id="past-events" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Vergangene Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {pastEvents.map((event, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center gap-6 group">
              <div className="md:w-1/3 overflow-hidden rounded-lg">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-48 md:h-36 object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center text-koes-red mb-2">
                  <Calendar size={16} className="mr-2" />
                  <span className="font-medium">{event.date}</span>
                </div>
                <h3 className="text-xl font-bold text-koes-dark mb-2 group-hover:text-koes-red transition-colors duration-300">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <button 
                  className="flex items-center text-koes-red hover:underline"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsModalOpen(true);
                  }}
                >
                  <Image size={16} className="mr-2" />
                  <span>Fotos ansehen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {isModalOpen && selectedEvent?.gallery && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-koes-dark">
                {selectedEvent.title} - Fotogalerie
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-koes-red transition-colors text-2xl leading-none hidden md:block"
              >
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedEvent.gallery.map((img, index) => (
                <div key={index} className="relative h-fit">
                  <img
                    src={img}
                    alt={`${selectedEvent.title} - Bild ${index + 1}`}
                    className="w-full h-auto rounded-lg hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(img, '_blank')}
                  />
                </div>
              ))}
            </div>
            {/* Mobile Close Button */}
            <div className="sticky bottom-0 w-full p-4 bg-white border-t md:hidden">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 px-4 bg-koes-red text-white rounded-lg hover:bg-koes-red/90 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PastEvents;
