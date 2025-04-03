
import { Calendar, Image } from 'lucide-react';

const PastEvents = () => {
  const pastEvents = [
    {
      id: 1,
      title: "Nationalfeiertag 2024",
      date: "26. Oktober 2024",
      description: "Feier des österreichischen Nationalfeiertags mit traditionellem Essen und Musik.",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Sommerfest am See",
      date: "15. Juli 2024",
      description: "Grillfest am Zürichsee mit Schwimmen, Spiel und Spaß.",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Skiwochenende Flumserberg",
      date: "10. Februar 2024",
      description: "Gemeinsames Wochenende auf den Schweizer Pisten mit Après-Ski.",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Wiener Kaffeehausnachmittag",
      date: "12. Dezember 2023",
      description: "Gemütlicher Nachmittag mit Wiener Kaffeespezialitäten und Mehlspeisen.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section id="past-events" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Vergangene Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {pastEvents.map((event) => (
            <div key={event.id} className="flex flex-col md:flex-row md:items-center gap-6 group">
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
                <button className="flex items-center text-koes-red hover:underline">
                  <Image size={16} className="mr-2" />
                  <span>Fotos ansehen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PastEvents;
