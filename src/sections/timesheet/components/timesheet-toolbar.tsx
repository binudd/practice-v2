import dayjs from 'dayjs';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TimesheetToolbarProps = {
  viewMode: 'week' | 'day';
  onViewMode: (mode: 'week' | 'day') => void;
  selectedDate: Date;
  onSelectedDate: (d: Date) => void;
  weekDays: string[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddTimeLog: () => void;
  canAdd: boolean;
  loading?: boolean;
};

export function TimesheetToolbar({
  viewMode,
  onViewMode,
  selectedDate,
  onSelectedDate,
  weekDays,
  onPrev,
  onNext,
  onToday,
  onAddTimeLog,
  canAdd,
  loading,
}: TimesheetToolbarProps) {
  const rangeLabel =
    weekDays.length > 0
      ? `${dayjs(weekDays[0]).format('MMM D')} – ${dayjs(weekDays[weekDays.length - 1]).format('MMM D')}`
      : '';

  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2}
      alignItems={{ lg: 'center' }}
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <IconButton onClick={onPrev} aria-label="Previous period" size="small">
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>
        <Typography variant="subtitle1" sx={{ minWidth: 160, textAlign: 'center', fontWeight: 600 }}>
          {rangeLabel}
        </Typography>
        <IconButton onClick={onNext} aria-label="Next period" size="small">
          <Iconify icon="eva:arrow-ios-forward-fill" />
        </IconButton>
        <Button size="small" variant="text" onClick={onToday}>
          {viewMode === 'week' ? 'This week' : 'Today'}
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <ToggleButtonGroup
          size="small"
          value={viewMode}
          exclusive
          onChange={(_, v) => v && onViewMode(v)}
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="day">Day</ToggleButton>
        </ToggleButtonGroup>

        <DatePicker
          label={viewMode === 'week' ? 'Week' : 'Day'}
          value={dayjs(selectedDate)}
          onChange={(v) => v && onSelectedDate(v.toDate())}
          slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
        />

        {canAdd && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onAddTimeLog}
            disabled={loading}
          >
            Add time log
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
