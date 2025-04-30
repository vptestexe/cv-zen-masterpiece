
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginHeader from "@/components/auth/LoginHeader";
import EmailLoginForm from "@/components/auth/EmailLoginForm";
import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import { useLoginForm } from "@/hooks/auth/use-login-form";

const Login = () => {
  const { 
    isLogin, 
    setIsLogin, 
    isLoading, 
    setIsLoading, 
    activeTab, 
    setActiveTab 
  } = useLoginForm();
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <LoginHeader isLogin={isLogin} />
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "phone")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Téléphone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <EmailLoginForm
                  isLogin={isLogin}
                  setIsLogin={setIsLogin}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </TabsContent>
              
              <TabsContent value="phone">
                <PhoneLoginForm 
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            {/* Footer content is now handled in the respective form components */}
          </CardFooter>
        </Card>
      </div>
      
      <footer className="bg-muted py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
        </div>
      </footer>
    </div>
  );
};

export default Login;
