import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Turnstile from 'react-turnstile';

interface CaptchaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (token: string) => Promise<void>;
  title: string;
  description: string;
}

const CaptchaDialog = ({
                         open,
                         onOpenChange,
                         onVerify,
                         title,
                         description,
                       }: CaptchaDialogProps) => {
  const handleVerify = async (token: string) => {
    await onVerify(token);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Turnstile
            sitekey="1x00000000000000000000AA"
            onVerify={handleVerify}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaptchaDialog;
