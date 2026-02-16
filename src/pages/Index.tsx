
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Team from "@/components/Team";
import FAQ from "@/components/FAQ";
import History from "@/components/History";
import Fotos from "@/components/Fotos";
import AlbumDialog from "@/components/AlbumDialog";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Events />
        <Fotos />
        <Team />
        <FAQ />
        <History />
      </main>
      <AlbumDialog />
      <Footer />
    </div>
  );
};

export default Index;
