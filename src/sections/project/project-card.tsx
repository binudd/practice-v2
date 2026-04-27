import type { MouseEvent } from 'react';
import type { IProject, IProjectStatus } from 'src/types/project';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { _mock } from 'src/_mock/_mock';
import { updateProject } from 'src/actions/project';
import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';
import { ProjectPolicy } from 'src/domain/project/project-policy';
import { deleteProjectCascade } from 'src/services/project-service';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { Can } from 'src/auth/guard';

// ----------------------------------------------------------------------

const statusLabel: Record<IProjectStatus, string> = PROJECT_STATUS_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<IProjectStatus, string>
);

const statusDotBg: Record<IProjectStatus, string> = {
  active: 'success.main',
  'on-hold': 'warning.main',
  completed: 'info.main',
  archived: 'grey.500',
};

// ----------------------------------------------------------------------

type Props = {
  project: IProject;
};

export function ProjectCard({ project }: Props) {
  const router = useRouter();

  const popover = usePopover();

  const handleOpenDetails = () => {
    router.push(paths.dashboard.project.details(project.id));
  };

  const handleOpenBoard = () => {
    router.push(paths.dashboard.project.kanban(project.id));
  };

  const handleOpenEdit = () => {
    router.push(paths.dashboard.project.edit(project.id));
  };

  const handleDelete = async () => {
    popover.onClose();
    await deleteProjectCascade(project);
  };

  const handleToggleFavorite = async (event: MouseEvent) => {
    event.stopPropagation();
    try {
      await updateProject(project.id, { isFavorite: !project.isFavorite });
    } catch (error) {
      console.error(error);
    }
  };

  const stopRowClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <>
      <Card
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          transition: (theme) => theme.transitions.create(['box-shadow', 'transform']),
          '&:hover': {
            boxShadow: (theme) => theme.customShadows?.z20,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }} onClick={handleOpenDetails}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Tooltip title={statusLabel[project.status]} arrow>
                <Box
                  component="span"
                  onClick={stopRowClick}
                  onMouseDown={stopRowClick}
                  sx={{ display: 'inline-flex', flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: statusDotBg[project.status],
                    }}
                  />
                </Box>
              </Tooltip>
              <Typography variant="caption" color="text.secondary" noWrap>
                {project.code}
              </Typography>
            </Stack>
            <Typography variant="subtitle1" noWrap>
              {project.name}
            </Typography>
          </Stack>

          <IconButton
            size="small"
            color={popover.open ? 'inherit' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              popover.onOpen(e);
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        {project.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between">
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              Start – End
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }} noWrap>
              {fDate(project.startDate)} – {project.endDate ? fDate(project.endDate) : '—'}
            </Typography>
          </Stack>

          <IconButton
            size="small"
            color={project.isFavorite ? 'warning' : 'default'}
            onClick={handleToggleFavorite}
            aria-label={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Iconify
              width={20}
              icon={project.isFavorite ? 'eva:star-fill' : 'eva:star-outline'}
            />
          </IconButton>

          <Stack alignItems="center" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
              }}
            >
              <CircularProgress
                variant="determinate"
                value={project.progress}
                size={44}
                thickness={4}
                aria-label={`${project.completedTasks} of ${project.totalTasks} tasks, ${project.progress}% complete`}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemiBold', fontSize: 11 }}>
                  {project.progress}%
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10, lineHeight: 1.2, textAlign: 'center', maxWidth: 56 }}
            >
              {project.completedTasks}/{project.totalTasks} tasks
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Owner
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {project.ownerName}
            </Typography>
          </Stack>

          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
            {project.members.map((memberId, index) => (
              <Avatar
                key={memberId}
                alt={`member-${index}`}
                src={_mock.image.avatar(index)}
              />
            ))}
          </AvatarGroup>
        </Stack>
      </Card>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              handleOpenDetails();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Details
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              handleOpenBoard();
            }}
          >
            <Iconify icon="solar:list-check-bold" />
            Open board
          </MenuItem>

          <Can policy={ProjectPolicy.canEdit} subject={project}>
            <MenuItem
              onClick={() => {
                popover.onClose();
                handleOpenEdit();
              }}
            >
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>
          </Can>

          <Can policy={ProjectPolicy.canDelete} subject={project}>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Delete
            </MenuItem>
          </Can>
        </MenuList>
      </CustomPopover>
    </>
  );
}
