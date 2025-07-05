import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEvents, CreateEventData, UpdateEventData } from '@/hooks/useEvents';
import { Event } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

const EVENT_TYPES = [
  { value: 'typical_costume', label: 'Traje Típico' },
  { value: 'evening_gown', label: 'Traje de Gala' },
  { value: 'qa', label: 'Preguntas y Respuestas' },
];

export const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
  const { createEvent, updateEvent } = useEvents();
  const [formData, setFormData] = useState({
    name: '',
    event_type: '',
    description: '',
    weight: 0,
    is_mandatory: true,
    bonus_percentage: 0,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        event_type: event.event_type || '',
        description: event.description || '',
        weight: event.weight || 0,
        is_mandatory: event.is_mandatory ?? true,
        bonus_percentage: event.bonus_percentage || 0,
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.event_type) {
      return;
    }

    // Validaciones
    if (formData.is_mandatory && formData.weight <= 0) {
      alert('Los eventos obligatorios deben tener un peso mayor a 0');
      return;
    }

    if (formData.weight < 0 || formData.weight > 100) {
      alert('El peso debe estar entre 0 y 100');
      return;
    }

    if (formData.bonus_percentage < 0 || formData.bonus_percentage > 100) {
      alert('El porcentaje de bonus debe estar entre 0 y 100');
      return;
    }

    try {
      if (event) {
        // Update existing event
        const updateData: UpdateEventData = {
          name: formData.name.trim(),
          event_type: formData.event_type as 'typical_costume' | 'evening_gown' | 'qa',
          description: formData.description.trim(),
          weight: formData.weight,
          is_mandatory: formData.is_mandatory,
          bonus_percentage: formData.bonus_percentage,
        };
        await updateEvent.mutateAsync({ id: event.id, data: updateData });
      } else {
        // Create new event
        const createData: CreateEventData = {
          name: formData.name.trim(),
          event_type: formData.event_type as 'typical_costume' | 'evening_gown' | 'qa',
          description: formData.description.trim(),
          weight: formData.weight,
          is_mandatory: formData.is_mandatory,
          bonus_percentage: formData.bonus_percentage,
        };
        await createEvent.mutateAsync(createData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isLoading = createEvent.isPending || updateEvent.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Evento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Traje Típico 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleChange('event_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción del evento..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de pesos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración de Puntajes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_mandatory"
              checked={formData.is_mandatory}
              onCheckedChange={(checked) => handleChange('is_mandatory', checked)}
            />
            <Label htmlFor="is_mandatory" className="font-medium">
              Evento Obligatorio
            </Label>
          </div>

          {formData.is_mandatory ? (
            <div className="space-y-2">
              <Label htmlFor="weight">Peso del Evento (%) *</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="Ej: 40"
                required={formData.is_mandatory}
              />
              <p className="text-sm text-muted-foreground">
                Los eventos obligatorios deben sumar 100% en total
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bonus_percentage">Porcentaje de Bonus (%)</Label>
              <Input
                id="bonus_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.bonus_percentage}
                onChange={(e) => handleChange('bonus_percentage', parseFloat(e.target.value) || 0)}
                placeholder="Ej: 10"
              />
              <p className="text-sm text-muted-foreground">
                Bonus adicional para eventos opcionales
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : event ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}; 