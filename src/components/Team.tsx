import { Mail } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Alexander Eggerth",
      role: "Präsident",
      bio: "Studiert Informatik an der ETH. Aus Oberösterreich.",
      image: "/team/aeggerth.jpg"
    },
    {
      id: 2,
      name: "Thomas Gratz",
      role: "Vizepräsident",
      bio: "Studiert Elektrotechnik an der ETH. Aus Salzburg.",
      // bio: "Student der Wirtschaftswissenschaften an der UZH. Aus Wien.",
      image: "/team/tgratz.jpg"
    },
    {
      id: 3,
      name: "Seungchan Hwang",
      role: "Kassier",
      bio: "Student der Statistik an der ETH. Aus Wien.",
      image: "/team/shwang.jpg"
    },
    {
      id: 4,
      name: "Christoph Schweighofer",
      role: "Sponsoring",
      bio: "Studiert Informatik an der ETH. Aus Oberösterreich.",
      image: "/team/cschweighofer.jpg"
    },
    {
      id: 5,
      name: "Anna Walther",
      role: "Event-Koordination",
      // bio: "Studiert Architektur an der ETH. Aus Graz.",
      bio: "Studiert Biodiversität an der UZH. Aus Vorarlberg.",
      image: "/team/awalther.jpg"
    },
    {
      id: 6,
      name: "Paul Stephan",
      role: "Social Media",
      bio: "Student der Statistik an der ETH. Aus Tirol.",
      image: "/team/pstephan.jpg"
    },
    {
      id: 7,
      name: "Lisa Walther",
      role: "Mitgliederbetreuung",
      bio: "Studiert an der PH. Aus Vorarlberg.",
      image: "/team/lwalther.jpg"
    },
    {
      id: 8,
      name: "Emanuel Mairoll",
      role: "Institutionelle Kontakte & Öffentlichkeitsarbeit",
      bio: "Studiert Cyber Security an der ETH. Aus Salzburg.",
      image: "/team/emairoll.jpg"
    },
    {
      id: 9,
      name: "Andreas Papon",
      role: "IT/Multimedia",
      bio: "Studiert Cyber Security an der ETH. Aus Vorarlberg.",
      image: "/placeholder.svg"
    },
    {
      id: 10,
      name: "Felix Stöger",
      role: "Mitgliederbetreuung",
      bio: "Doktorand in Informatik an der ETH. Aus Oberösterreich.",
      image: "/team/fstöger.jpg"
    },
    {
      id: 11,
      name: "Markus Limbeck",
      role: "Mitgliederbetreuung",
      bio: "Informatik-Absolvent der ETH. Aus Niederösterreich.",
      image: "/team/mlimbeck.jpg"
    }
  ];

  return (
    <section id="team" className="section-padding bg-gray-50">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Unser Vorstand</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 justify-items-center">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 w-[280px]"
            >
              <div className="h-80 overflow-hidden">
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
                  href={`mailto:${member.name.toLowerCase().split(' ').join('.')}@koes.ch`}
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
