import type { Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type BoxSx = React.ComponentProps<typeof Box>['sx'];

type Props = {
  children: React.ReactNode;
  /** When false, skips the padded card wrapper (e.g. full-height chat-style panels). */
  card?: boolean;
  sx?: BoxSx;
};

export function ProjectTabShell({ children, card = true, sx }: Props) {
  return (
    <Box
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...sx,
      }}
    >
      {card ? (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: (theme: Theme) => theme.customShadows.card,
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
