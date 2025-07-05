import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { useI18n } from '../../app/I18nProvider';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Crown, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const DEMO_USERS = [
  { email: 'admin@demo.com', role: 'admin' },
  { email: 'juez@demo.com', role: 'judge' },
  { email: 'notario@demo.com', role: 'notary' },
  { email: 'superadmin@demo.com', role: 'superadmin' },
  { email: 'usuario@demo.com', role: 'user' },
];
const DEMO_PASSWORD = 'demo123';

const LoginPage = () => {
  const { login, register, isLoading } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, remember);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Credenciales inválidas. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await register(registerName, registerEmail, registerPassword);
      setIsRegisterOpen(false);
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl items-stretch justify-center py-10">
        {/* Card Login */}
        <Card className="backdrop-blur-md bg-white/90 border-green-200 shadow-2xl w-full max-w-md mx-auto flex flex-col justify-center min-h-[480px]">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ESPE Reinas
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sistema de Votación Digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  {t('auth.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-green-200 focus:border-green-400 transition-colors"
                  placeholder="ejemplo@espe.edu.ec"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  {t('auth.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-green-200 focus:border-green-400 transition-colors"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-green-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  {t('auth.remember')}
                </Label>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  t('auth.login')
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-green-600 hover:text-green-700">
                    {t('auth.create_account')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-gray-800">
                      {t('auth.register')}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">{t('auth.name')}</Label>
                      <Input
                        id="register-name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="border-green-200 focus:border-green-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('auth.email')}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="border-green-200 focus:border-green-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('auth.password')}</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="border-green-200 focus:border-green-400"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t('auth.confirm_password')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-green-200 focus:border-green-400"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        t('auth.register')
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        {/* Card Usuarios Demo */}
        <Card className="bg-green-50/90 border-2 border-green-400 shadow-xl w-full max-w-md mx-auto flex flex-col justify-center min-h-[480px]">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full mb-2">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-green-800">Usuarios Demo</CardTitle>
            <CardDescription className="text-green-700 text-sm mt-1">Accede a todos los roles fácilmente</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <table className="w-full text-base mb-3 rounded overflow-hidden">
              <thead>
                <tr>
                  <th className="text-left text-green-700 pb-1">Usuario</th>
                  <th className="text-left text-green-700 pb-1">Rol</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map((u, i) => (
                  <tr key={u.email} className={i % 2 === 0 ? 'bg-green-100/60' : ''}>
                    <td className="font-mono text-green-900 py-1 text-base">{u.email}</td>
                    <td className="py-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-green-200 text-green-800' :
                        u.role === 'judge' ? 'bg-emerald-200 text-emerald-800' :
                        u.role === 'notary' ? 'bg-lime-200 text-lime-800' :
                        u.role === 'superadmin' ? 'bg-teal-200 text-teal-800' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-sm text-green-800 text-center mt-2 font-semibold">
              Contraseña para todos: <span className="font-mono font-bold">{DEMO_PASSWORD}</span>
            </div>
            <div className="text-xs text-green-700 text-center mt-1 flex items-center justify-center gap-1">
              <svg className="w-4 h-4 text-green-500 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              Puedes usar cualquier usuario para navegar los distintos roles
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-xl w-full">
        <p className="text-sm text-blue-800 font-medium mb-2">Información del sistema:</p>
        <div className="text-xs text-blue-600 space-y-1">
          <p>• Utiliza las credenciales proporcionadas por el administrador</p>
          <p>• El sistema cuenta con diferentes roles de usuario</p>
          <p>• Contacta al soporte técnico si tienes problemas de acceso</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
