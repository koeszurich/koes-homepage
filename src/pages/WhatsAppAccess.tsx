import { useState } from 'react';
import Turnstile from '@marsidev/react-turnstile';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppAccess = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string>('');

  const whatsappUrl = 'https://chat.whatsapp.com/LW1Lwhvr3leJDJlDDpSngG';

  const handleVerify = (token: string) => {
    setToken(token);
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <MessageSquare className="h-16 w-16 text-koes-red" />
            </div>
            <h1 className="text-4xl font-bold mb-4">WhatsApp Gruppe beitreten</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Verifiziere dich, um Zugang zu unserer WhatsApp Gruppe zu erhalten
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {!isVerified ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Sicherheitsüberprüfung</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bitte bestätige, dass du kein Roboter bist
                  </p>
                </div>

                {/* Turnstile Widget */}
                <div className="flex justify-center">
                  <Turnstile
                    siteKey="1x00000000000000000000AA"
                    onSuccess={handleVerify}
                    options={{
                      theme: 'light',
                      size: 'normal',
                    }}
                  />
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Diese Seite wird durch Cloudflare Turnstile geschützt
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle2 className="h-12 w-12 mr-2" />
                  <span className="text-xl font-semibold">Verifizierung erfolgreich!</span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Du kannst nun unserer WhatsApp Gruppe beitreten. Klicke auf den Button unten, um direkt zur Gruppe zu gelangen.
                  </p>

                  <Button
                    asChild
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
                    size="lg"
                  >
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      WhatsApp Gruppe öffnen
                    </a>
                  </Button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-semibold mb-2">Hinweis:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Du wirst zu WhatsApp weitergeleitet</li>
                    <li>Der Link ist nur für unsere KÖS-Gruppe gültig</li>
                    <li>Bitte lies die Gruppenregeln nach dem Beitritt</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p>
              Zurück zur{' '}
              <a href="/" className="text-koes-red hover:underline font-semibold">
                Startseite
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAccess;
