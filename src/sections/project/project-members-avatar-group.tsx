import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import { nameToInitials, avatarSxFromPaletteKey } from 'src/utils/avatar-display';

import { _mock } from 'src/_mock/_mock';
import { _userList } from 'src/_mock/_user';

// ----------------------------------------------------------------------

const MOCK_USER_NAME_BY_ID = new Map(_userList.map((u) => [u.id, u.name]));

function hashSeedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h += id.charCodeAt(i);
  }
  return Math.abs(h) % 40;
}

function displayNameForMemberId(id: string): string {
  return MOCK_USER_NAME_BY_ID.get(id) ?? _mock.fullName(hashSeedFromId(id));
}

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  members: readonly string[];
  /** DataGrid rows: slightly smaller avatars. */
  compact?: boolean;
};

export function ProjectMembersAvatarGroup({ projectId, members, compact }: Props) {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const memberRows = useMemo(
    () => members.map((id) => ({ id, name: displayNameForMemberId(id) })),
    [members]
  );

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchor(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchor(null);
  }, []);

  const size = compact
    ? { wh: 24, fontSize: 10, groupMax: 4 as const }
    : { wh: 28, fontSize: 11, groupMax: 4 as const };

  if (memberRows.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
        —
      </Typography>
    );
  }

  const popoverId = `project-members-${projectId}`;

  return (
    <>
      <ButtonBase
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? popoverId : undefined}
        onClick={handleOpen}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{
          borderRadius: 1,
          py: compact ? 0.25 : 0,
          '&:focus-visible': { outlineOffset: 2 },
        }}
      >
        <AvatarGroup
          max={size.groupMax}
          sx={{
            '& .MuiAvatar-root': {
              width: size.wh,
              height: size.wh,
              fontSize: size.fontSize,
            },
          }}
        >
          {memberRows.map(({ id, name }) => (
            <Tooltip key={id} title={name} arrow>
              <Avatar alt={name} sx={avatarSxFromPaletteKey(theme, id)}>
                {nameToInitials(name)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      </ButtonBase>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { mt: 1, minWidth: 220, maxWidth: 360, py: 0.5 },
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 0.25 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.08 }}>
            Team members ({memberRows.length})
          </Typography>
        </Box>
        <List dense disablePadding>
          {memberRows.map(({ id, name }) => (
            <ListItem key={id} sx={{ px: 2, py: 0.75 }}>
              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar sx={{ ...avatarSxFromPaletteKey(theme, id), width: 32, height: 32, fontSize: 12 }}>
                  {nameToInitials(name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }} primary={name} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
}
