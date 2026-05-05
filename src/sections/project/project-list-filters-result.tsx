import type { IProjectPriority } from 'src/types/project';
import type { IDatePickerControl } from 'src/types/common';
import type { Theme, SxProps } from '@mui/material/styles';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { fDateRangeShortLabel } from 'src/utils/format-time';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

import { ProjectPriorityKanbanIcon } from './project-priority-kanban-style';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  priorities: IProjectPriority[];
  startDate: IDatePickerControl;
  endDate: IDatePickerControl;
  search?: string;
  onRemoveSearch?: () => void;
  onRemovePriority: (value: IProjectPriority) => void;
  onRemoveDateRange: () => void;
  onReset: () => void;
};

export function ProjectListFiltersResult({
  totalResults,
  sx,
  priorities,
  startDate,
  endDate,
  search = '',
  onRemoveSearch,
  onRemovePriority,
  onRemoveDateRange,
  onReset,
}: Props) {
  const handleRemovePriority = useCallback(
    (value: IProjectPriority) => {
      onRemovePriority(value);
    },
    [onRemovePriority]
  );

  return (
    <FiltersResult totalResults={totalResults} onReset={onReset} sx={sx}>
      <FiltersBlock label="Search:" isShow={Boolean(search.trim()) && Boolean(onRemoveSearch)}>
        <Chip
          {...chipProps}
          label={search.trim()}
          onDelete={() => onRemoveSearch?.()}
          sx={{ maxWidth: 1 }}
        />
      </FiltersBlock>

      <FiltersBlock label="Priority:" isShow={priorities.length > 0}>
        {priorities.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            icon={<ProjectPriorityKanbanIcon priority={item} />}
            label={item}
            onDelete={() => handleRemovePriority(item)}
            sx={{
              textTransform: 'capitalize',
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Start date:" isShow={Boolean(startDate && endDate)}>
        <Chip
          {...chipProps}
          label={fDateRangeShortLabel(startDate, endDate)}
          onDelete={onRemoveDateRange}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
