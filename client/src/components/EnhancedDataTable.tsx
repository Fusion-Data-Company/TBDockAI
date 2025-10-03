import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectedRowsChange?: (rows: T[]) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export default function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  exportable = true,
  selectable = false,
  onRowClick,
  onSelectedRowsChange,
  pageSize = 10,
  emptyMessage = 'No data available',
}: EnhancedDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Column filter
    if (filterColumn && filterValue) {
      result = result.filter(row => {
        const value = String(row[filterColumn as keyof T] || '').toLowerCase();
        return value.includes(filterValue.toLowerCase());
      });
    }

    return result;
  }, [data, search, filterColumn, filterValue]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn as keyof T];
      const bVal = b[sortColumn as keyof T];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (column: keyof T | string) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);

    if (onSelectedRowsChange) {
      const selectedData = Array.from(newSelected).map(i => sortedData[i]);
      onSelectedRowsChange(selectedData);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
      onSelectedRowsChange?.([]);
    } else {
      const allIndices = sortedData.map((_, i) => i);
      setSelectedRows(new Set(allIndices));
      onSelectedRowsChange?.(sortedData);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',');
    const rows = sortedData.map(row =>
      columns.map(col => {
        const value = row[col.key as keyof T];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterableColumns = columns.filter(col => col.filterable);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full sm:w-auto">
          {searchable && (
            <div className="relative flex-1 max-w-sm w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>
          )}

          {filterableColumns.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger className="bg-secondary/50 border-border/50 w-32">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  {filterableColumns.map(col => (
                    <SelectItem key={String(col.key)} value={String(col.key)}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterColumn && (
                <Input
                  placeholder="Value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="bg-secondary/50 border-border/50 w-32"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
              {selectedRows.size} selected
            </Badge>
          )}
          {exportable && (
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="bg-secondary/50 border-border/50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border/50">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border/50 bg-secondary/50"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-sm font-semibold text-muted-foreground ${column.className || ''}`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center space-x-1 hover:text-foreground transition-colors"
                      >
                        <span>{column.label}</span>
                        {sortColumn === column.key && (
                          <svg
                            className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                          </svg>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const globalIndex = (currentPage - 1) * pageSize + rowIndex;
                  const isSelected = selectedRows.has(globalIndex);

                  return (
                    <tr
                      key={rowIndex}
                      onClick={() => onRowClick?.(row)}
                      className={`border-b border-border/30 transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-secondary/50' : ''
                      } ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRowSelect(globalIndex);
                            }}
                            className="rounded border-border/50 bg-secondary/50"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={`px-4 py-3 text-sm text-foreground ${column.className || ''}`}
                        >
                          {column.render
                            ? column.render(row[column.key as keyof T], row)
                            : String(row[column.key as keyof T] || '-')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-secondary/50 border-border/50"
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, current, and adjacent pages
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  // Add ellipsis
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 border-border/50'}
                    >
                      {page}
                    </Button>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-secondary/50 border-border/50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
