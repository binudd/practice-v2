import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  DateNavTitle,
  DateToolbarRow,
  DateNavArrowBack,
  DateNavArrowForward,
} from 'src/components/date-nav';

// ----------------------------------------------------------------------

export type TimesheetToolbarProps = {
  viewMode: 'week' | 'day';
  onViewMode: (mode: 'week' | 'day') => void;
  selectedDate: Date;
  onSelectedDate: (d: Date) => void;
  weekDays: string[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Shows the same loading line as the calendar toolbar while entries load. */
  loading?: boolean;
};

/**
 * Date controls aligned with [`CalendarToolbar`](calendar/calendar-toolbar.tsx): same
 * `DateToolbarRow`, nav arrows, and `DateNavTitle`. Week/day toggle and jump picker stay
 * timesheet-specific; “This week” / “Today” remain text buttons for the existing subtle UX.
 */
export function TimesheetToolbar({
  viewMode,
  onViewMode,
  selectedDate,
  onSelectedDate,
  weekDays,
  onPrev,
  onNext,
  onToday,
  loading,
}: TimesheetToolbarProps) {
  const rangeLabel =
    weekDays.length > 0
      ? `${dayjs(weekDays[0]).format('MMM D')} – ${dayjs(weekDays[weekDays.length - 1]).format('MMM D')}`
      : '';

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
      }}
    >
      <DateToolbarRow loading={loading}>
        <ToggleButtonGroup
          size="small"
          value={viewMode}
          exclusive
          onChange={(_, v) => v && onViewMode(v)}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="day">Day</ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" alignItems="center" spacing={1}>
          <DateNavArrowBack onClick={onPrev} aria-label="Previous period" />
          <DateNavTitle
            variant="subtitle1"
            sx={{
              minWidth: { xs: 120, sm: 200 },
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {rangeLabel}
          </DateNavTitle>
          <DateNavArrowForward onClick={onNext} aria-label="Next period" />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" justifyContent="flex-end">
          <Button size="small" variant="text" onClick={onToday}>
            {viewMode === 'week' ? 'This week' : 'Today'}
          </Button>

          <DatePicker
            label={viewMode === 'week' ? 'Week' : 'Day'}
            value={dayjs(selectedDate)}
            onChange={(v) => v && onSelectedDate(v.toDate())}
            views={['year', 'month', 'day']}
            openTo="month"
            slotProps={{
              textField: {
                size: 'small',
                sx: (t) => ({
                  minWidth: t.spacing(18),
                  maxWidth: '100%',
                }),
              },
            }}
          />
        </Stack>
      </DateToolbarRow>
    </Box>
  );
}
