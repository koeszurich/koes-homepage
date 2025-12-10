import {createContext, useContext, useState, useCallback, ReactNode} from 'react';
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

const WHATSAPP_HASH = '#whatsapp';

const openUrl = (url: string, new_tab: boolean) => {
  if (new_tab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
};

enum DialogState {
  Closed,
  ImplicitlyOpened,
  ExplicitlyOpened,
}

const WhatsAppProvider = ({children}: WhatsAppProviderProps) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [dialogState, setDialogState] = useState<DialogState>(
    window.location.hash === WHATSAPP_HASH ? DialogState.ImplicitlyOpened : DialogState.Closed
  );

  const getUrl = async (token: string): Promise<string> => {
    // Stub implementation - returns static example URL
    return 'https://chat.whatsapp.com/LW1Lwhvr3leJDJlDDpSngG';
  };

  const handleVerify = useCallback(async (token: string) => {
    const whatsappUrl = await getUrl(token);
    setUrl(whatsappUrl);
    // don't open new tab if the dialog was opened implicitly (e.g., via URL fragment), otherwise browsers will block it
    openUrl(whatsappUrl, dialogState === DialogState.ExplicitlyOpened);
  }, [dialogState]);

  const handleDialogStateChange = useCallback((state: DialogState) => {
    setDialogState(state);
    if (state === DialogState.Closed) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.history.replaceState(null, '', WHATSAPP_HASH);
    }
  }, []);

  const openWhatsApp = useCallback(() => {
    if (url) {
      openUrl(url, true);
    } else {
      handleDialogStateChange(DialogState.ExplicitlyOpened);
    }
  }, [url, handleDialogStateChange]);

  return (
    <WhatsAppContext.Provider value={{openWhatsApp}}>
      {children}
      <CaptchaDialog
        open={dialogState !== DialogState.Closed}
        onOpenChange={open => handleDialogStateChange(open ? DialogState.ExplicitlyOpened : DialogState.Closed)}
        onVerify={handleVerify}
        title="WhatsApp"
        description="Bitte löse das Captcha, um unserer WhatsApp-Community beizutreten."
      />
    </WhatsAppContext.Provider>
  );
};

export default WhatsAppProvider;
