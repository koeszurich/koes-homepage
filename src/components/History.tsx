
import { BookOpen } from 'lucide-react';

const History = () => {
  return (
    <section id="history" className="section-padding bg-gray-50">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center">Unsere Geschichte</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-md mt-12">
            <div className="flex items-start">
              <BookOpen size={32} className="text-koes-red mr-4 mt-1 flex-shrink-0" />
              <div>
                <p className="text-lg leading-relaxed text-gray-700 mb-4">
                  Der Klub der Österreichischen Studierenden Zürich (KÖS) wurde 2017 gegründet, um österreichische Studierende in Zürich zu vernetzen. Was als kleine Gruppe von Freunden begann, die ihr Heimweh nach Österreich teilen wollten, hat sich zu einer lebendigen Gemeinschaft mit über 200 Mitgliedern entwickelt.
                </p>
                <p className="text-lg leading-relaxed text-gray-700 mb-4">
                  Seitdem organisieren wir regelmäßig Veranstaltungen, bieten Unterstützung beim Ankommen in der Schweiz und pflegen ein starkes Gemeinschaftsgefühl unter Österreicher:innen in Zürich. Unser Ziel ist es, ein Stück Heimat in der Ferne zu schaffen und kulturelle Brücken zu bauen.
                </p>
                <p className="text-lg leading-relaxed text-gray-700">
                  Von traditionellen Feiern wie dem Nationalfeiertag und dem Krampuslauf bis hin zu Stamm­tischen, Wanderungen und Skiausflügen – der KÖS bietet vielfältige Möglichkeiten, die österreichische Kultur zu feiern und gleichzeitig neue Freundschaften zu knüpfen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
