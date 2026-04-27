import type { IProjectPriority } from 'src/types/project';
import type { IDatePickerControl } from 'src/types/common';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import {
  PROJECT_PRIORITY_OPTIONS,
  ProjectPriorityKanbanIcon,
} from './project-priority-kanban-style';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  canReset: boolean;
  dateError: boolean;
  onClose: () => void;
  onReset: () => void;
  priorities: IProjectPriority[];
  startDate: IDatePickerControl;
  endDate: IDatePickerControl;
  onChangePriorities: (value: IProjectPriority[]) => void;
  onChangeStartDate: (value: IDatePickerControl) => void;
  onChangeEndDate: (value: IDatePickerControl) => void;
};

export function ProjectListFilters({
  open,
  onClose,
  onReset,
  canReset,
  dateError,
  priorities,
  startDate,
  endDate,
  onChangePriorities,
  onChangeStartDate,
  onChangeEndDate,
}: Props) {
  const togglePriority = useCallback(
    (option: IProjectPriority) => {
      const next = priorities.includes(option)
        ? priorities.filter((p) => p !== option)
        : [...priorities, option];
      onChangePriorities(next);
    },
    [priorities, onChangePriorities]
  );

  const renderHead = (
    <>
      <Box display="flex" alignItems="center" sx={{ py: 2, pr: 1, pl: 2.5 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filters
        </Typography>

        <Tooltip title="Reset">
          <IconButton onClick={onReset}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );

  const renderPriorities = (
    <Box display="flex" flexDirection="column" sx={{ my: 3, px: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Priority
      </Typography>
      <Stack direction="row" flexWrap="wrap" spacing={1}>
        {PROJECT_PRIORITY_OPTIONS.map((option) => {
          const selected = priorities.includes(option);
          return (
            <ButtonBase
              key={option}
              onClick={() => togglePriority(option)}
              sx={{
                py: 0.5,
                pl: 0.75,
                pr: 1.25,
                fontSize: 12,
                borderRadius: 1,
                lineHeight: '20px',
                textTransform: 'capitalize',
                fontWeight: 'fontWeightBold',
                boxShadow: (theme) =>
                  `inset 0 0 0 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
                ...(selected && {
                  boxShadow: (theme) => `inset 0 0 0 2px ${theme.vars.palette.text.primary}`,
                }),
              }}
            >
              <ProjectPriorityKanbanIcon priority={option} sx={{ mr: 0.5 }} />
              {option}
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );

  const renderDateRange = (
    <Box display="flex" flexDirection="column" sx={{ mb: 3, px: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Start date range
      </Typography>

      <DatePicker
        label="Start date"
        value={startDate}
        onChange={onChangeStartDate}
        sx={{ mb: 2.5 }}
      />

      <DatePicker
        label="End date"
        value={endDate}
        onChange={onChangeEndDate}
        slotProps={{
          textField: {
            error: dateError,
            helperText: dateError ? 'End date must be later than start date' : null,
          },
        }}
      />
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: 320 } }}
    >
      {renderHead}

      <Scrollbar>
        {renderPriorities}
        {renderDateRange}
      </Scrollbar>
    </Drawer>
  );
}
