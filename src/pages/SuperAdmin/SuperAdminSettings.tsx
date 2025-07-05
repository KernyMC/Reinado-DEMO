import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Settings, Shield, Users, Save, Server, Database, Lock } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { eventsService } from '../../services/api';

interface PermissionMatrix {
  [role: string]: {
    [action: string]: boolean;
  };
}

interface SystemSettings {
  judgeVoteWeight: number;
  maxVotesPerUser: number;
  requireEmailVerification: boolean;
  autoCloseVoting: boolean;
  votingDuration: number; // in hours
}

const SuperAdminSettings = () => {
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [settings, setSettings] = useState<SystemSettings>({
    judgeVoteWeight: 100,
    maxVotesPerUser: 1,
    requireEmailVerification: true,
    autoCloseVoting: false,
    votingDuration: 24
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);

  const roles = ['judge', 'notary', 'admin', 'superadmin'];
  const actions = [
    'judge_events',
    'monitor_votes',
    'manage_candidates',
    'manage_events',
    'generate_reports',
    'manage_users',
    'system_settings'
  ];

  const actionLabels = {
    judge_events: 'Calificar Eventos',
    monitor_votes: 'Monitorear Votos',
    manage_candidates: 'Gestionar Candidatas',
    manage_events: 'Gestionar Eventos',
    generate_reports: 'Generar Reportes',
    manage_users: 'Gestionar Usuarios',
    system_settings: 'Configuración del Sistema'
  };

  const roleLabels = {
    judge: 'Juez',
    notary: 'Notario',
    admin: 'Admin',
    superadmin: 'Super Admin'
  };

  useEffect(() => {
    // TODO call API - Load permissions and settings
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPermissions: PermissionMatrix = {
        judge: {
          judge_events: true,
          monitor_votes: false,
          manage_candidates: false,
          manage_events: false,
          generate_reports: false,
          manage_users: false,
          system_settings: false
        },
        notary: {
          judge_events: false,
          monitor_votes: true,
          manage_candidates: false,
          manage_events: false,
          generate_reports: true,
          manage_users: false,
          system_settings: false
        },
        admin: {
          judge_events: false,
          monitor_votes: true,
          manage_candidates: true,
          manage_events: true,
          generate_reports: true,
          manage_users: false,
          system_settings: false
        },
        superadmin: {
          judge_events: false,
          monitor_votes: true,
          manage_candidates: true,
          manage_events: true,
          generate_reports: true,
          manage_users: true,
          system_settings: true
        }
      };
      
      setPermissions(mockPermissions);
      setLoading(false);
      fetchEvents(); // Llamar para cargar eventos demo
    };

    loadData();
  }, []);

  const togglePermission = (role: string, action: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [action]: !prev[role][action]
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      // TODO call API - Save settings and permissions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Configuración guardada",
        description: "Todas las configuraciones han sido guardadas exitosamente.",
        className: "bg-green-50 border-green-200",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const result = await eventsService.getAll();
      setEvents(result);
    } catch (error) {
      setEvents([]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl border border-green-200">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Settings className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Configuración del Sistema
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gestiona permisos, roles y configuraciones globales del sistema de votaciones
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Permissions Matrix */}
        <div className="xl:col-span-2">
          <Card className="shadow-xl border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center">
                <Shield className="w-6 h-6 mr-3" />
                Matriz de Permisos por Rol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto bg-white rounded-lg border border-green-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-50 border-b border-green-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-700 min-w-[200px]">Permisos</th>
                      {roles.map(role => (
                        <th key={role} className="text-center py-4 px-3 font-bold text-gray-700 min-w-[120px]">
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-green-100 rounded-full mb-2">
                              <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm">{roleLabels[role]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((action, index) => (
                      <tr key={action} className={`border-b border-green-100 hover:bg-green-25 transition-colors ${index % 2 === 0 ? 'bg-green-25' : 'bg-white'}`}>
                        <td className="py-4 px-4 font-medium text-gray-800">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            {actionLabels[action]}
                          </div>
                        </td>
                        {roles.map(role => (
                          <td key={`${role}-${action}`} className="py-4 px-3 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={permissions[role]?.[action] || false}
                                onCheckedChange={() => togglePermission(role, action)}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Tabla de eventos demo */}
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-2 text-green-700">Eventos del Sistema (Demo)</h3>
                {events.length === 0 ? (
                  <div className="text-gray-500 text-sm">No hay eventos registrados.</div>
                ) : (
                  <table className="w-full border mt-2">
                    <thead>
                      <tr className="bg-green-50 border-b border-green-200">
                        <th className="py-2 px-4 text-left">Nombre</th>
                        <th className="py-2 px-4 text-left">Tipo</th>
                        <th className="py-2 px-4 text-left">Estado</th>
                        <th className="py-2 px-4 text-left">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev: any) => (
                        <tr key={ev.id} className="border-b border-green-100">
                          <td className="py-2 px-4">{ev.name}</td>
                          <td className="py-2 px-4">{ev.type}</td>
                          <td className="py-2 px-4">{ev.is_active ? 'Activo' : 'Inactivo'}</td>
                          <td className="py-2 px-4">{ev.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Settings */}
        <div>
          <Card className="shadow-xl border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center">
                <Server className="w-6 h-6 mr-3" />
                Configuraciones Globales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Judge Settings */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-gray-800 flex items-center mb-6">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  Configuración de Calificaciones
                </h4>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Label className="font-semibold text-gray-700">Peso de Calificaciones de Jueces</Label>
                      <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                        {settings.judgeVoteWeight}%
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.judgeVoteWeight]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, judgeVoteWeight: value }))}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-gray-800 flex items-center mb-6">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  Configuraciones de Seguridad
                </h4>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-100">
                    <div>
                      <Label className="font-semibold text-gray-700">Verificación de email requerida</Label>
                      <p className="text-sm text-gray-600 mt-1">Los usuarios deben verificar su email</p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-100">
                    <div>
                      <Label className="font-semibold text-gray-700">Cierre automático de eventos</Label>
                      <p className="text-sm text-gray-600 mt-1">Cerrar eventos automáticamente</p>
                    </div>
                    <Switch
                      checked={settings.autoCloseVoting}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCloseVoting: checked }))}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                  
                  {settings.autoCloseVoting && (
                    <div className="p-4 bg-white rounded-lg border border-green-100">
                      <div className="flex justify-between items-center mb-3">
                        <Label className="font-semibold text-gray-700">Duración de eventos (horas)</Label>
                        <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                          {settings.votingDuration}h
                        </Badge>
                      </div>
                      <Slider
                        value={[settings.votingDuration]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, votingDuration: value }))}
                        max={168} // 7 days
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1h</span>
                        <span>84h</span>
                        <span>168h</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
          size="lg"
        >
          {saving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Guardando configuración...
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>

      {/* System Info */}
      <Card className="shadow-xl border-green-200 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center">
            <Database className="w-6 h-6 mr-3" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">v1.0.0</div>
              <div className="text-sm text-gray-600 font-medium">Versión del Sistema</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">156</div>
              <div className="text-sm text-gray-600 font-medium">Usuarios Registrados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600 font-medium">Tiempo de Actividad</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">4,374</div>
              <div className="text-sm text-gray-600 font-medium">Calificaciones Procesadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSettings;
