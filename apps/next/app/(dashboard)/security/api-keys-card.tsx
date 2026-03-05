'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Skeleton } from '@repo/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { useSetState } from 'ahooks'
import { useApiKeysList, useCreateApiKey, useRevokeApiKey } from 'hooks/use-api-keys'
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

const createKeySchema = z.object({ name: z.string().min(1).max(64) })

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

export function ApiKeysCard() {
  const { data, isLoading, isError, error } = useApiKeysList()
  const createMutation = useCreateApiKey()
  const revokeMutation = useRevokeApiKey()
  const [state, setState] = useSetState({
    createOpen: false,
    createName: '',
    createdKey: null as string | null,
    revokeId: null as string | null,
  })

  if (isLoading)
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )

  if (isError)
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error?.message ?? 'Failed to load API keys'}</p>
        </CardContent>
      </Card>
    )

  const keys = data?.keys ?? []

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API keys</CardTitle>
          <CardDescription>
            Manage API keys for programmatic access. Keys are shown once at creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setState({ createOpen: true })}>
              <PlusIcon />
              Create key
            </Button>
          </div>
          {keys.length === 0 ? (
            <p className="text-muted-foreground text-sm">No API keys yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map(k => (
                  <TableRow key={k.id}>
                    <TableCell>{k.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{k.prefix}…</TableCell>
                    <TableCell>
                      {typeof k.lastUsedAt === 'string' ? formatDate(k.lastUsedAt) : 'Never'}
                    </TableCell>
                    <TableCell>{formatDate(String(k.createdAt))}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Revoke ${k.name}`}
                        onClick={() => setState({ revokeId: k.id })}
                      >
                        <Trash2Icon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={state.createOpen} onOpenChange={open => setState({ createOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Give your key a name to identify it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              value={state.createName}
              onChange={e => setState({ createName: e.target.value })}
              placeholder="e.g. Production"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setState({ createOpen: false })}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const parsed = createKeySchema.safeParse({ name: state.createName.trim() })
                if (!parsed.success) return
                try {
                  const res = await createMutation.mutateAsync({ name: parsed.data.name })
                  setState({ createOpen: false, createName: '', createdKey: res.key })
                  toast.success("API key created. Copy it now—you won't see it again.")
                } catch {
                  toast.error('Failed to create API key')
                }
              }}
              disabled={!state.createName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!state.createdKey}
        onOpenChange={open => !open && setState({ createdKey: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your API key</AlertDialogTitle>
            <AlertDialogDescription>
              Copy this key now. You won&apos;t be able to see it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <code className="flex-1 break-all font-mono text-sm">{state.createdKey}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                if (!state.createdKey) return
                await navigator.clipboard.writeText(state.createdKey)
                toast.success('Copied to clipboard')
              }}
              aria-label="Copy key"
            >
              <CopyIcon />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setState({ createdKey: null })}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!state.revokeId}
        onOpenChange={open => !open && setState({ revokeId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate the key. Any applications using it will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!state.revokeId) return
                try {
                  await revokeMutation.mutateAsync({ id: state.revokeId })
                  toast.success('API key revoked')
                  setState({ revokeId: null })
                } catch {
                  toast.error('Failed to revoke API key')
                }
              }}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? 'Revoking…' : 'Revoke'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
