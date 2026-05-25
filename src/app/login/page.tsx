"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { loginAction } from "../actions/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await loginAction(null, formData);

    // Journalisation du résultat dans la console du navigateur
    console.log("LOG: Résultat de la Server Action (loginAction):", result);

    if (result.error) {
      setError({ open: true, message: result.error });
      setLoading(false);
    } else if (result.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-night p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-orange-accent/30 orange-glow">
            <Image 
              src="/logo.jpeg" 
              alt="Logo" 
              fill 
              sizes="80px"
              className="object-cover" 
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-bold text-white">Connexion</h1>
            <p className="text-muted-foreground text-sm">Bienvenue sur Diarraba Volaille</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" className="bg-white/5 border-white/10" placeholder="votre@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput id="password" name="password" required />
          </div>
          <Button type="submit" className="w-full bg-orange-accent text-night font-bold" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Se connecter"}
          </Button>
        </form>
      </div>

      <Dialog open={error.open} onOpenChange={(v) => setError({...error, open: v})}>
        <DialogContent className="bg-night text-white text-center border-white/10">
            <DialogHeader className="flex flex-col items-center gap-2">
              <AlertCircle className="h-10 w-10 text-destructive" /> 
              <DialogTitle>Erreur</DialogTitle>
              <div className="sr-only">Description de l'erreur de connexion</div>
            </DialogHeader>
            <p className="text-muted-foreground">{error.message}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}