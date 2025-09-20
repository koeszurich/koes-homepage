const Events = () => {
  return (
    <section id="events" className="section-padding section-events bg-gray-50">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Events</h2>
        <p className="section-subtitle text-center">
          Hier findest du unsere kommenden Veranstaltungen.
        </p>
        <div className="mx-auto text-center">
          <iframe
            className="calendar"
            src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FZurich&showPrint=0&showTitle=0&mode=AGENDA&hl=de&showCalendars=0&src=NmM4ODA4ZjU1YmUyODhkODgxNjc5OTk1OWUwYmVmYWIwNTk2YWZiNzdjOWI5MDEyZjllYmZlMzRhY2NmMDBiYkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23d50000"
            frameBorder="0" scrolling="no"></iframe>
        </div>
      </div>
    </section>
  );
};

export default Events;
