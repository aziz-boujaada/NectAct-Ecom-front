import React from 'react';

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({ headers, children, loading }) => {
  return (
    <div className={`table-wrap fade-in ${loading ? 'loading-overlay' : ''}`}>
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};
