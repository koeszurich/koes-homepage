import {useEffect} from 'react';

const Events = () => {
  useEffect(() => {
    // script for uniclubs widget
    const script = document.createElement('script');
    script.src = 'https://uniclubs.ch/embed/uniclubs-events.js';
    script.defer = true;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // remove on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="events" className="section-padding section-events bg-gray-50">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Events</h2>
        <p className="section-subtitle text-center">
          Hier findest du unsere kommenden Veranstaltungen.
        </p>
        <div className="mx-auto text-center">
          <div data-uniclubs-events=""
               data-club="koes"
               data-max-events="12"
               data-language="de"
               data-accent-color="#d62c29"
               data-hide-header="true"/>
        </div>
      </div>
    </section>
  );
};

export default Events;
