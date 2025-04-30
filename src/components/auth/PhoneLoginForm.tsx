
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhoneLoginFormProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const PhoneLoginForm = ({ isLoading, setIsLoading }: PhoneLoginFormProps) => {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!codeSent) {
        // Send verification code
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        
        if (error) {
          throw error;
        }
        
        setCodeSent(true);
        toast({
          title: "Code envoyé",
          description: "Un code de vérification a été envoyé à votre numéro de téléphone.",
        });
      } else {
        // Verify the code
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: verificationCode,
          type: 'sms',
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
      }
    } catch (error: any) {
      console.error("Phone authentication error:", error);
      toast({
        title: "Erreur d'authentification",
        description: error.message || "Une erreur est survenue lors de l'authentification par téléphone.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handlePhoneSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <div className="flex">
          <div className="flex items-center mr-2">
            <Phone className="h-5 w-5 text-gray-500" />
          </div>
          <Input 
            id="phone" 
            placeholder="+33612345678" 
            required 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={codeSent}
          />
        </div>
        <p className="text-xs text-gray-500">Format international, ex: +33612345678</p>
      </div>
      
      {codeSent && (
        <div className="space-y-2">
          <Label htmlFor="code">Code de vérification</Label>
          <Input 
            id="code" 
            placeholder="123456" 
            required 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            {codeSent ? "Vérification..." : "Envoi du code..."}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {codeSent ? "Vérifier le code" : "Recevoir un code"}
          </span>
        )}
      </Button>
      
      {codeSent && (
        <Button 
          type="button" 
          variant="outline"
          className="w-full mt-2" 
          onClick={() => setCodeSent(false)}
        >
          Changer de numéro
        </Button>
      )}
    </form>
  );
};

export default PhoneLoginForm;
