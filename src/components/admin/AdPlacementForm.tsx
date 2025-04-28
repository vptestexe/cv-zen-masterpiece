
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { AdPlacement, AdPosition, AdSize, AdNetwork } from "@/types/admin";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  position: z.string().min(1, "La position est requise"),
  size: z.string().min(1, "La taille est requise"),
  network: z.string().min(1, "Le réseau publicitaire est requis"),
  isActive: z.boolean(),
  adCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdPlacementFormProps {
  placement?: AdPlacement | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AdPlacementForm({ placement, onClose, onSave }: AdPlacementFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: placement?.position || "top",
      size: placement?.size || "banner",
      network: placement?.network || "adsense",
      isActive: placement?.isActive ?? true,
      adCode: "",
    },
  });

  async function handleSubmit(values: FormValues) {
    if (!user?.id) return;

    setLoading(true);
    try {
      const adData = {
        position: values.position,
        size: values.size,
        network: values.network,
        is_active: values.isActive,
        // Ajouter des champs supplémentaires pour les codes publicitaires si nécessaire
        updated_at: new Date().toISOString(),
      };

      let result;
      
      if (placement?.id) {
        // Mise à jour d'un emplacement existant
        result = await supabase
          .from('ad_placements')
          .update(adData)
          .eq('id', placement.id);
          
        // Journaliser l'activité d'administration
        await supabase
          .from('admin_activity_logs')
          .insert({
            admin_id: user.id,
            action: 'update',
            entity_type: 'ad_placement',
            entity_id: placement.id,
            details: {
              old: {
                position: placement.position,
                size: placement.size,
                network: placement.network,
                isActive: placement.isActive,
              },
              new: values
            }
          });
          
        toast({
          title: "Succès",
          description: "L'emplacement publicitaire a été mis à jour",
        });
      } else {
        // Création d'un nouvel emplacement
        result = await supabase
          .from('ad_placements')
          .insert({
            ...adData,
            start_date: new Date().toISOString(),
          });
          
        const newId = result.data?.[0]?.id;
        
        // Journaliser l'activité d'administration
        if (newId) {
          await supabase
            .from('admin_activity_logs')
            .insert({
              admin_id: user.id,
              action: 'create',
              entity_type: 'ad_placement',
              entity_id: newId,
              details: values
            });
        }
        
        toast({
          title: "Succès",
          description: "L'emplacement publicitaire a été créé",
        });
      }

      if (result.error) {
        throw result.error;
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving ad placement:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={() => !loading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {placement ? "Modifier l'emplacement" : "Nouvel emplacement"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="top">Haut</SelectItem>
                      <SelectItem value="bottom">Bas</SelectItem>
                      <SelectItem value="sidebar">Barre latérale</SelectItem>
                      <SelectItem value="inline">Dans le contenu</SelectItem>
                      <SelectItem value="fixed">Fixe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une taille" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="banner">Bannière (468x60)</SelectItem>
                      <SelectItem value="rectangle">Rectangle (300x250)</SelectItem>
                      <SelectItem value="leaderboard">Grand format (728x90)</SelectItem>
                      <SelectItem value="skyscraper">Skyscraper (160x600)</SelectItem>
                      <SelectItem value="mobile">Mobile (320x50)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Réseau publicitaire</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un réseau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="adsense">Google AdSense</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("network") === "adsense" && (
              <FormField
                control={form.control}
                name="adCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code AdSense</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Collez votre code AdSense ici"
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("network") === "direct" && (
              <FormField
                control={form.control}
                name="adCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code HTML publicitaire</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Collez votre code HTML ici"
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Actif</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
