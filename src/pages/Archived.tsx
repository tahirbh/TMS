import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Archive, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentDetailDialog from '@/components/documents/DocumentDetailDialog';

export default function Archived() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
  });

  const restoreMutation = useMutation({
    mutationFn: (doc: any) => base44.entities.Document.update(doc.id, { status: 'confirmed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const archivedDocuments = (documents as any[]).filter((d: any) => d.status === 'archived');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Archived Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">Documents that have been archived</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-muted mb-4" />
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : archivedDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <Archive className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-1">No archived documents</h3>
          <p className="text-sm text-muted-foreground">Archived documents will appear here</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedDocuments.map((doc: any, i: number) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <DocumentCard
                document={doc}
                onView={setSelectedDoc}
                onArchive={() => {}}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3 gap-1.5 text-xs"
                onClick={() => restoreMutation.mutate(doc)}
              >
                <RotateCcw className="w-3 h-3" />
                Restore
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <DocumentDetailDialog document={selectedDoc} open={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}