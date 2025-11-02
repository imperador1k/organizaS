'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';

export const SessionStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSessionTime = () => {
      try {
        const authData = localStorage.getItem('organizas_auth_data');
        if (authData) {
          const { timestamp, rememberMe } = JSON.parse(authData);
          // Atualizado para 90 dias
          const timeLeft = 90 * 24 * 60 * 60 * 1000 - (Date.now() - timestamp); // 90 dias em ms
          const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
          
          setSessionTimeLeft(daysLeft);
          
          // Mostrar aviso se restam menos de 7 dias (aumentado de 3 dias)
          if (daysLeft <= 7 && rememberMe) {
            setShowWarning(true);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar tempo de sessão:', error);
      }
    };

    checkSessionTime();
    
    // Verificar a cada hora (mantido o mesmo intervalo)
    const interval = setInterval(checkSessionTime, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleRefreshSession = () => {
    if (user) {
      user.getIdToken(true).then(() => {
        // Atualizar timestamp no localStorage
        const authData = localStorage.getItem('organizas_auth_data');
        if (authData) {
          const parsed = JSON.parse(authData);
          parsed.timestamp = Date.now();
          localStorage.setItem('organizas_auth_data', JSON.stringify(parsed));
        }
        
        toast({
          title: "Sessão Renovada",
          description: "Sua sessão foi renovada com sucesso!",
        });
        
        setShowWarning(false);
      }).catch((error) => {
        console.error('Erro ao renovar sessão:', error);
        toast({
          variant: "destructive",
          title: "Erro ao Renovar Sessão",
          description: "Não foi possível renovar sua sessão. Tente fazer login novamente.",
        });
      });
    }
  };

  if (!showWarning || !sessionTimeLeft) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Sua sessão expira em {sessionTimeLeft} dias. A sessão agora dura até 90 dias, então você não precisará fazer login com tanta frequência.
          {sessionTimeLeft <= 1 && " Faça login novamente para continuar usando a aplicação."}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshSession}
          className="ml-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Renovar
        </Button>
      </AlertDescription>
    </Alert>
  );
};
