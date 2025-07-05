import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Candidate, CreateCandidateData, UpdateCandidateData, getImageUrl } from '@/services/api';
import { useCandidates } from '@/hooks/useCandidates';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  candidate,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    major: candidate?.major || '',
    department: candidate?.department || '',
    biography: candidate?.biography || '',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    candidate?.image_url ? getImageUrl(candidate.image_url) : null
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createCandidate, updateCandidate } = useCandidates();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(candidate?.image_url ? getImageUrl(candidate.image_url) : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (candidate) {
        // Update existing candidate
        const updateData: UpdateCandidateData = {
          ...formData,
          ...(selectedImage && { image: selectedImage }),
        };
        await updateCandidate.mutateAsync({ id: candidate.id, data: updateData });
      } else {
        // Create new candidate
        const createData: CreateCandidateData = {
          ...formData,
          ...(selectedImage && { image: selectedImage }),
        };
        await createCandidate.mutateAsync(createData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  const isLoading = createCandidate.isPending || updateCandidate.isPending;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {candidate ? 'Editar Candidata' : 'Nueva Candidata'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Foto de la Candidata</Label>
            <div className="flex flex-col items-center space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xs"
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej: María García"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Carrera *</Label>
              <Input
                id="major"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                required
                placeholder="Ej: Ingeniería de Sistemas"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department">Departamento *</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                placeholder="Ej: Ciencias de la Computación"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="biography">Biografía</Label>
              <Textarea
                id="biography"
                name="biography"
                value={formData.biography}
                onChange={handleInputChange}
                placeholder="Información adicional sobre la candidata..."
                rows={4}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : candidate ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 