import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function RoleTable({
  roles = [],
  onAdd,
  onEdit,
  onRequestDelete,
  deletingId = null,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) {
  const showActionColumn = canUpdate || canDelete;

  const [search, setSearch] = useState('');
  const filtered = roles.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      (r.permissions || []).some((p) => p.name?.toLowerCase().includes(q))
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          {canCreate && (
            <Button onClick={onAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!search && roles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No roles found.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No roles match your search.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                {showActionColumn && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(role.permissions || []).length > 0 ? (
                        (role.permissions || []).map((permission) => (
                          <span key={permission.id} className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                            {permission.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No permissions</span>
                      )}
                    </div>
                  </TableCell>
                  {showActionColumn && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">

                      {canUpdate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit ${role.name}`}
                                onClick={() => onEdit?.(role.id)}
                              >
                                <Pencil />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {canDelete && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete ${role.name}`}
                                onClick={() => onRequestDelete?.(role)}
                                disabled={deletingId === role.id}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                     
                    </div>
                  </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
