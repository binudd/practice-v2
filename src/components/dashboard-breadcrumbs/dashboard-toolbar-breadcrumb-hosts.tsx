import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { BreadcrumbsLink } from 'src/components/custom-breadcrumbs/breadcrumb-link';

import { useDashboardBreadcrumbsContext } from './dashboard-breadcrumbs-context';

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: 'text.disabled',
      }}
    />
  );
}

/** Renders the trail in the app bar (left cluster, after logo / divider). */
export function DashboardToolbarBreadcrumbsHost() {
  const {
    state: { links },
  } = useDashboardBreadcrumbsContext();

  if (!links.length) {
    return null;
  }

  const lastLink = links[links.length - 1]?.name;

  return (
    <Box
      sx={{
        minWidth: 0,
        flex: '1 1 auto',
        maxWidth: { xs: '40vw', sm: 320, md: 480, lg: 640 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        pl: { xs: 1, sm: 1.5 },
      }}
    >
      <Breadcrumbs
        separator={<Separator />}
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
          },
          '& .MuiBreadcrumbs-li': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          },
        }}
      >
        {links.map((link, index) => (
          <BreadcrumbsLink
            key={link.name ?? index}
            link={link}
            disabled={link.name === lastLink}
          />
        ))}
      </Breadcrumbs>
    </Box>
  );
}

/** Renders optional page actions before global header actions (search, etc.). */
export function DashboardToolbarPageActionsHost() {
  const {
    state: { action },
  } = useDashboardBreadcrumbsContext();

  if (!action) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        gap: 1,
        mr: { xs: 0.5, sm: 1 },
      }}
    >
      {action}
    </Box>
  );
}
