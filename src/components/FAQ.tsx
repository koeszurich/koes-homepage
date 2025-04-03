
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqItems = [
    {
      question: "Wie kann ich Mitglied werden?",
      answer: "Um Mitglied zu werden, fülle einfach das Anmeldeformular auf unserer Website aus oder komm zu einem unserer Events und melde dich vor Ort an. Die Mitgliedschaft steht allen österreichischen Studierenden in Zürich offen!"
    },
    {
      question: "Kostet die Mitgliedschaft etwas?",
      answer: "Nein, die Mitgliedschaft im KÖS ist kostenlos. Wir finanzieren unsere Aktivitäten durch Sponsoren und freiwillige Beiträge."
    },
    {
      question: "Muss ich Österreicher:in sein?",
      answer: "Hauptsächlich richtet sich der KÖS an Studierende aus Österreich, aber wir freuen uns auch über Mitglieder aus anderen Ländern, die eine Verbindung zu Österreich haben oder einfach an unserer Gemeinschaft teilhaben möchten."
    },
    {
      question: "Wie kann ich dem WhatsApp-Chat beitreten?",
      answer: "Du kannst dem WhatsApp-Chat über den Link auf unserer Website beitreten oder uns eine Nachricht mit deiner Telefonnummer schicken, damit wir dich hinzufügen können."
    },
    {
      question: "Wie oft finden Events statt?",
      answer: "Wir organisieren mehrere Events pro Semester, darunter regelmäßige Stammtische, kulturelle Veranstaltungen, Ausflüge und Feiern zu österreichischen Anlässen."
    },
    {
      question: "Kann ich bei der Organisation von Events mithelfen?",
      answer: "Natürlich! Wir freuen uns immer über engagierte Mitglieder, die bei der Organisation und Durchführung von Events mithelfen möchten. Sprich einfach ein Vorstandsmitglied an oder schreib uns eine E-Mail."
    }
  ];

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">FAQ – Häufig gestellte Fragen</h2>
        
        <div className="max-w-3xl mx-auto mt-12">
          {faqItems.map((item, index) => (
            <div key={index} className="mb-4">
              <button
                className={`w-full flex justify-between items-center p-5 text-left rounded-md transition-colors ${
                  openItem === index 
                    ? 'bg-koes-red text-white' 
                    : 'bg-gray-100 text-koes-dark hover:bg-gray-200'
                }`}
                onClick={() => toggleItem(index)}
                aria-expanded={openItem === index}
              >
                <span className="font-medium text-lg">{item.question}</span>
                {openItem === index ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              
              {openItem === index && (
                <div className="p-5 bg-white border border-gray-200 rounded-b-md shadow-sm mt-1 animate-accordion-down">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
