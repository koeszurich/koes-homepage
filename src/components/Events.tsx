
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Semestereröffnungsfeier",
      date: "15. September 2025",
      time: "19:00 Uhr",
      location: "Polyterrasse ETH Zürich",
      description: "Wir starten gemeinsam ins neue Semester mit Networking, Getränken und österreichischen Spezialitäten.",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Stammtisch im Josef",
      date: "5. Oktober 2025",
      time: "20:00 Uhr",
      location: "Café Josef, Europaallee 48",
      description: "Unser monatlicher Stammtisch für gemütliches Beisammensein und Austausch.",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Wanderung Uetliberg",
      date: "20. Oktober 2025",
      time: "10:00 Uhr",
      location: "Treffpunkt: HB Zürich, Gleis 7",
      description: "Gemeinsame Wanderung auf den Uetliberg mit Picknick und herrlicher Aussicht über Zürich.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section id="events" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Events</h2>
        <p className="section-subtitle text-center">
          Hier findest du unsere kommenden Veranstaltungen.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-koes-dark mb-2">{event.title}</h3>
                
                <div className="flex items-start mb-2">
                  <Calendar size={18} className="text-koes-red mr-2 mt-1 flex-shrink-0" />
                  <span>{event.date}</span>
                </div>
                
                <div className="flex items-start mb-2">
                  <Clock size={18} className="text-koes-red mr-2 mt-1 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                
                <div className="flex items-start mb-4">
                  <MapPin size={18} className="text-koes-red mr-2 mt-1 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                
                <p className="text-gray-600 mb-6">{event.description}</p>
              </div>
              
              <div className="px-6 pb-6 mt-auto">
                <button className="w-full cta-button-primary flex items-center justify-center">
                  <Users size={18} className="mr-2" />
                  Teilnehmen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
