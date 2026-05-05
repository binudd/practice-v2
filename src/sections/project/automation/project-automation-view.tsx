import type { IAutomationRule } from 'src/domain/automation';

import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { useProjectAutomations, setProjectAutomationEnabled } from 'src/actions/project-automations';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { ProjectTabShell } from '../_components/project-tab-shell';
import { AutomationCreateDialog } from './automation-create-dialog';

// ----------------------------------------------------------------------

const PARAM = 'automation';

type Props = { projectId: string };

function Detail({ row, onBack }: { row: IAutomationRule; onBack: () => void }) {
  return (
    <ProjectTabShell card={false}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        <IconButton onClick={onBack} aria-label="Back">
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>
        <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
          {row.name}
        </Typography>
        <Label color={row.enabled ? 'success' : 'default'} variant="soft">
          {row.enabled ? 'On' : 'Off'}
        </Label>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                When
              </Typography>
              <Typography variant="body2">{row.triggerLabel}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Then
              </Typography>
              <Typography variant="body2">{row.actionLabel}</Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              Updated {fToNow(row.updatedAt)}
            </Typography>
          </Stack>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectAutomationView({ projectId }: Props) {
  const openCreate = useBoolean();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(PARAM);
  const { automations, automationsLoading, automationsEmpty } = useProjectAutomations(projectId);

  const selected = useMemo(
    () => (rawId ? automations.find((a) => a.id === rawId) : undefined),
    [rawId, automations]
  );

  useEffect(() => {
    if (rawId && !automationsLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, automationsLoading]);

  const openRow = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(PARAM, id);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const closeRow = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(PARAM);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const toggleEnabled = useCallback(
    async (ruleId: string, enabled: boolean) => {
      await setProjectAutomationEnabled(projectId, ruleId, enabled);
    },
    [projectId]
  );

  if (selected) {
    return (
      <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Detail row={selected} onBack={closeRow} />
      </Box>
    );
  }

  return (
    <ProjectTabShell>
      <Stack sx={{ flex: '1 1 auto', minHeight: 0, width: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" sx={{ p: 2.5, pb: 0 }}>
          <Typography variant="h6" sx={{ typography: { sm: 'h5' } }}>
            Automation
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="medium"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate.onTrue}
          >
            New rule
          </Button>
        </Stack>

        {automationsLoading ? (
          <ChatNavItemSkeleton />
        ) : automationsEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-content.svg`}
              title="No automations"
              description="Describe triggers and actions for this project."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {automations.map((row) => (
                <Box
                  key={row.id}
                  component="li"
                  sx={{ display: 'flex', alignItems: 'stretch', pr: 1 }}
                >
                  <ListItemButton
                    onClick={() => openRow(row.id)}
                    sx={{ py: 1.5, px: 2.5, gap: 2, flex: 1 }}
                  >
                    <ListItemText
                      primary={row.name}
                      secondary={row.triggerLabel}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, alignSelf: 'center' }}>
                      {fToNow(row.updatedAt)}
                    </Typography>
                  </ListItemButton>
                  <Switch
                    checked={row.enabled}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(_, v) => {
                      toggleEnabled(row.id, v).catch(() => {});
                    }}
                    sx={{ alignSelf: 'center' }}
                    inputProps={{ 'aria-label': `Toggle ${row.name}` }}
                  />
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>

      <AutomationCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </ProjectTabShell>
  );
}
