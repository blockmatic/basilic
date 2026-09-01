import { Skeleton } from '@repo/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'

function MarketsCardSkeleton() {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

function MarketsTableSkeleton() {
  return (
    <div className="hidden w-full min-w-0 overflow-hidden xl:block">
      <Table className="table-fixed w-full" fluid>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[4%] lg:table-cell">#</TableHead>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead className="w-[18%] text-right">Price</TableHead>
            <TableHead className="w-[8%] text-right">%</TableHead>
            <TableHead className="hidden w-[10%] text-right md:table-cell">Market cap</TableHead>
            <TableHead className="hidden w-[10%] text-right md:table-cell">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }, (_, i) => (
            <TableRow key={i}>
              <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-14" />
              </TableCell>
              <TableCell className="hidden text-right md:table-cell">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
              <TableCell className="hidden text-right md:table-cell">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for loading.tsx
export default function MarketsLoading(): React.JSX.Element {
  return (
    <div className="min-w-0 w-full max-w-full space-y-2">
      <div className="space-y-2 xl:hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <MarketsCardSkeleton key={i} />
        ))}
      </div>
      <MarketsTableSkeleton />
    </div>
  )
}
