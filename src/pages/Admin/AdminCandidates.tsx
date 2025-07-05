
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DrawerForm } from '../../components/DrawerForm';
import { Candidate } from '../../components/CandidateCarousel';
import { Plus, Search, Edit, Trash2, Upload } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface CandidateForm {
  name: string;
  major: string;
  department: string;
  image: string;
}

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CandidateForm>({
    name: '',
    major: '',
    department: '',
    image: ''
  });

  useEffect(() => {
    // TODO call API - Load candidates
    const loadCandidates = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'María Fernanda González',
          major: 'Ingeniería de Sistemas',
          department: 'DECC',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b9a2?w=600&h=800&fit=crop&crop=face'
        },
        {
          id: '2',
          name: 'Ana Sofía Rodríguez',
          major: 'Ingeniería Civil',
          department: 'DECI',
          image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=800&fit=crop&crop=face'
        },
        {
          id: '3',
          name: 'Valentina Castro',
          major: 'Administración de Empresas',
          department: 'DEAD',
          image: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&h=800&fit=crop&crop=face'
        },
        {
          id: '4',
          name: 'Isabella Morales',
          major: 'Ingeniería Electrónica',
          department: 'DEEL',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face'
        },
        {
          id: '5',
          name: 'Camila Herrera',
          major: 'Medicina Veterinaria',
          department: 'DEVT',
          image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face'
        }
      ];
      
      setCandidates(mockCandidates);
      setLoading(false);
    };

    loadCandidates();
  }, []);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddForm = () => {
    setEditingCandidate(null);
    setFormData({ name: '', major: '', department: '', image: '' });
    setIsDrawerOpen(true);
  };

  const openEditForm = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      major: candidate.major,
      department: candidate.department,
      image: candidate.image
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // TODO call API - Save candidate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (editingCandidate) {
        // Update existing candidate
        setCandidates(prev => prev.map(c => 
          c.id === editingCandidate.id 
            ? { ...c, ...formData }
            : c
        ));
        toast({
          title: "Candidata actualizada",
          description: "Los datos de la candidata han sido actualizados exitosamente.",
        });
      } else {
        // Add new candidate
        const newCandidate: Candidate = {
          id: Date.now().toString(),
          ...formData
        };
        setCandidates(prev => [...prev, newCandidate]);
        toast({
          title: "Candidata agregada",
          description: "La nueva candidata ha sido registrada exitosamente.",
        });
      }
      
      setIsDrawerOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la candidata. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta candidata?')) return;
    
    try {
      // TODO call API - Delete candidate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast({
        title: "Candidata eliminada",
        description: "La candidata ha sido eliminada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la candidata. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Gestión de Candidatas
        </h1>
        <p className="text-gray-600">
          Administra la información de las candidatas del certamen
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar candidatas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-purple-200 focus:border-purple-400"
          />
        </div>
        <Button
          onClick={openAddForm}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Candidata
        </Button>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="shadow-lg border-purple-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openEditForm(candidate)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => deleteCandidate(candidate.id)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{candidate.name}</h3>
              <p className="text-purple-600 font-medium mb-1">{candidate.major}</p>
              <p className="text-gray-600 text-sm">{candidate.department}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron candidatas que coincidan con la búsqueda.</p>
        </div>
      )}

      {/* Drawer Form */}
      <DrawerForm
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingCandidate ? "Editar Candidata" : "Agregar Candidata"}
        description="Completa la información de la candidata"
        onSubmit={handleSubmit}
        submitLabel={editingCandidate ? "Actualizar" : "Agregar"}
        loading={submitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="María Fernanda González"
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
          
          <div>
            <Label htmlFor="major">Carrera</Label>
            <Input
              id="major"
              value={formData.major}
              onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
              placeholder="Ingeniería de Sistemas"
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
          
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="DECC"
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
          
          <div>
            <Label htmlFor="image">URL de Imagen</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="border-purple-200 focus:border-purple-400"
            />
            <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 text-sm text-purple-800">
                <Upload className="w-4 h-4" />
                <span>Subir imagen desde dispositivo (Próximamente)</span>
              </div>
            </div>
          </div>
          
          {formData.image && (
            <div>
              <Label>Vista Previa</Label>
              <div className="mt-2 border border-purple-200 rounded-lg overflow-hidden">
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b9a2?w=200&h=200&fit=crop&crop=face';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </DrawerForm>
    </div>
  );
};

export default AdminCandidates;
