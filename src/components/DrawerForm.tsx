
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface DrawerFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export const DrawerForm: React.FC<DrawerFormProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Guardar",
  loading = false
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold text-gray-800">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-gray-600 mt-1">
                  {description}
                </SheetDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {children}
          
          {onSubmit && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={onSubmit} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? "Guardando..." : submitLabel}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
