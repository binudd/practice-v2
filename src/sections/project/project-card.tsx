import type { IProject, IProjectStatus } from 'src/types/project';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { _mock } from 'src/_mock/_mock';
import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';
import { ProjectPolicy } from 'src/domain/project/project-policy';
import { deleteProjectCascade } from 'src/services/project-service';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { Can } from 'src/auth/guard';

// ----------------------------------------------------------------------

const statusLabel: Record<IProjectStatus, string> = PROJECT_STATUS_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<IProjectStatus, string>
);

const statusColor: Record<
  IProjectStatus,
  'success' | 'warning' | 'info' | 'default' | 'error' | 'primary' | 'secondary'
> = {
  active: 'success',
  'on-hold': 'warning',
  completed: 'info',
  archived: 'default',
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
            <Typography variant="caption" color="text.secondary">
              {project.code}
            </Typography>
            <Typography variant="subtitle1" noWrap>
              {project.name}
            </Typography>
          </Stack>

          <IconButton
            size="small"
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        <Label variant="soft" color={statusColor[project.status]} sx={{ alignSelf: 'flex-start' }}>
          {statusLabel[project.status]}
        </Label>

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

        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
              {project.completedTasks}/{project.totalTasks} tasks · {project.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{ height: 6, borderRadius: 1 }}
          />
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
