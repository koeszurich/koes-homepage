
import { Mail } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Maximilian Schmidt",
      role: "Präsident",
      bio: "Student der Wirtschaftswissenschaften an der UZH. Aus Wien.",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Viktoria Hofer",
      role: "Vizepräsidentin",
      bio: "Studiert Informatik an der ETH. Aus Salzburg.",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Thomas Gruber",
      role: "Kassier",
      bio: "Student der Physik an der ETH. Aus Innsbruck.",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Elisabeth Wagner",
      role: "Event-Koordination",
      bio: "Studiert Architektur an der ETH. Aus Graz.",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Michael Huber",
      role: "Social Media",
      bio: "Student der Kommunikationswissenschaften an der UZH. Aus Klagenfurt.",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Sarah Bauer",
      role: "Mitgliederbetreuung",
      bio: "Studiert Psychologie an der UZH. Aus Linz.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section id="team" className="section-padding bg-gray-50">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Unser Vorstand</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-koes-dark">{member.name}</h3>
                <p className="text-koes-red font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <a 
                  href={`mailto:${member.role.toLowerCase()}@koes.ch`}
                  className="inline-flex items-center text-gray-600 hover:text-koes-red transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  <span>Kontakt</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
