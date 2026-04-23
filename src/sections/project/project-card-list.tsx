import type { IProject } from 'src/types/project';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { ProjectCard } from './project-card';

// ----------------------------------------------------------------------

type Props = {
  projects: IProject[];
};

export function ProjectCardList({ projects }: Props) {
  const [page, setPage] = useState(1);

  const rowsPerPage = 12;

  const handleChangePage = useCallback((event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  }, []);

  const pageCount = Math.max(1, Math.ceil(projects.length / rowsPerPage));

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)',
        }}
      >
        {projects
          .slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
          .map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
      </Box>

      {pageCount > 1 && (
        <Pagination
          page={page}
          shape="circular"
          count={pageCount}
          onChange={handleChangePage}
          sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
        />
      )}
    </>
  );
}
