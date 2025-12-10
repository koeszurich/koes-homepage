import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Turnstile, {useTurnstile} from 'react-turnstile';
import {useCallback} from 'react';

interface CaptchaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verify: (token: string) => Promise<boolean>;
  title: string;
  description: string;
}

const CaptchaDialog = ({
                         open,
                         onOpenChange,
                         verify,
                         title,
                         description,
                       }: CaptchaDialogProps) => {
  const turnstile = useTurnstile();

  const handleVerify = useCallback(async (token: string) => {
    const isValid = await verify(token);
    if (isValid) {
      onOpenChange(false);
    } else {
      turnstile.reset();
    }
  }, [turnstile, onOpenChange, verify]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Turnstile
            sitekey="0x4AAAAAACCbAdhgi1Po4BHy"
            onVerify={handleVerify}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaptchaDialog;
