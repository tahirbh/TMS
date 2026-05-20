import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentDetailDialog from '@/components/documents/DocumentDetailDialog';

export default function Documents() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
  });

  const docs = documents as any[];

  const archiveMutation = useMutation({
    mutationFn: (doc: any) => base44.entities.Document.update(doc.id, { status: 'archived' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const activeDocuments = docs.filter((d: any) => d.status !== 'archived');

  const filtered = activeDocuments.filter((doc: any) => {
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    const matchesSearch = !search || 
      doc.extracted_fields?.some((f: any) => 
        f.value?.toLowerCase().includes(search.toLowerCase()) || 
        f.label?.toLowerCase().includes(search.toLowerCase())
      );
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">All Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and manage your extracted documents</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="muqeem">Muqeem</SelectItem>
              <SelectItem value="driving_license">Driving License</SelectItem>
              <SelectItem value="vehicle_registration">Vehicle Registration</SelectItem>
              <SelectItem value="energy_permit">Energy Permit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i: number) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-muted mb-4" />
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-1">No documents found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc: any, i: number) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <DocumentCard
                document={doc}
                onView={setSelectedDoc}
                onArchive={(d: any) => archiveMutation.mutate(d)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <DocumentDetailDialog document={selectedDoc} open={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}