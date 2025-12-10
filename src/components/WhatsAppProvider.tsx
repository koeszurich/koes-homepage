import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CaptchaDialog from './CaptchaDialog';

interface WhatsAppContextType {
  openWhatsApp: () => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};

interface WhatsAppProviderProps {
  children: ReactNode;
}

const WhatsAppProvider = ({ children }: WhatsAppProviderProps) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const verifyAndGetUrl = async (_token: string): Promise<string> => {
    // Stub implementation - returns static example URL
    return 'https://chat.whatsapp.com/LW1Lwhvr3leJDJlDDpSngG';
  };

  const handleVerify = useCallback(async (token: string) => {
    const whatsappUrl = await verifyAndGetUrl(token);
    setUrl(whatsappUrl);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const openWhatsApp = useCallback(() => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setDialogOpen(true);
    }
  }, [url]);

  return (
    <WhatsAppContext.Provider value={{ openWhatsApp }}>
      {children}
      <CaptchaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onVerify={handleVerify}
        title="Verifizierung erforderlich"
        description="Bitte bestätige, dass du kein Roboter bist, um dem WhatsApp-Chat beizutreten."
      />
    </WhatsAppContext.Provider>
  );
};

export default WhatsAppProvider;
