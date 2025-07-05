import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCandidates } from '@/hooks/useCandidates';
import { CandidateForm } from '@/components/admin/CandidateForm';
import { Candidate, getImageUrl } from '@/services/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const CandidatesAdmin: React.FC = () => {
  const { candidates, isLoading, error, refetch, deleteCandidate } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleView = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsViewOpen(true);
  };

  const handleDelete = async (candidate: Candidate) => {
    try {
      await deleteCandidate.mutateAsync(candidate.id);
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCandidate(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedCandidate(null);
  };

  const CandidateCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
    console.log('🎯 Rendering candidate:', candidate.name, 'with image_url:', candidate.image_url);
    const imageUrl = getImageUrl(candidate.image_url);
    console.log('🎯 Final image URL for', candidate.name, ':', imageUrl);
    
    return (
      <Card className="overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={imageUrl}
            alt={candidate.name}
            className="w-full h-full object-cover rounded-[10px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.log('❌ Image failed to load for', candidate.name, ', src was:', target.src);
              target.src = '/placeholder-candidate.svg';
              console.log('🔄 Fallback image set for', candidate.name);
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully for', candidate.name);
            }}
          />
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground">{candidate.major}</p>
            <p className="text-sm text-muted-foreground">{candidate.department}</p>
            <div className="flex items-center justify-between">
              <Badge variant={candidate.is_active ? 'default' : 'secondary'}>
                {candidate.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleView(candidate)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(candidate)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar candidata?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente a {candidate.name} y todos sus datos.
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(candidate)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administrar Candidatas</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Candidata
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCandidate ? 'Editar Candidata' : 'Nueva Candidata'}
              </DialogTitle>
            </DialogHeader>
            <CandidateForm
              candidate={selectedCandidate || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Error al cargar candidatas: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : !candidates?.length ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No hay candidatas registradas</p>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Candidata
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Nueva Candidata</DialogTitle>
                </DialogHeader>
                <CandidateForm
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Total: {candidates.length} candidata{candidates.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Vista detallada */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCandidate.name}</DialogTitle>
                <DialogDescription>Información detallada de la candidata</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={getImageUrl(selectedCandidate.image_url)}
                    alt={selectedCandidate.name}
                    className="w-48 h-48 object-cover rounded-[10px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-candidate.svg';
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Carrera</h4>
                    <p className="text-muted-foreground">{selectedCandidate.major}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Departamento</h4>
                    <p className="text-muted-foreground">{selectedCandidate.department}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Estado</h4>
                    <Badge variant={selectedCandidate.is_active ? 'default' : 'secondary'}>
                      {selectedCandidate.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold">Registrada</h4>
                    <p className="text-muted-foreground">
                      {new Date(selectedCandidate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedCandidate.biography && (
                  <div>
                    <h4 className="font-semibold mb-2">Biografía</h4>
                    <p className="text-muted-foreground">{selectedCandidate.biography}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 