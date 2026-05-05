import type { IKanbanAssignee } from 'src/types/kanban';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { _contacts } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';
import { PaletteLetterAvatar } from 'src/components/palette-letter-avatar';

// ----------------------------------------------------------------------

/** Minimal row for search + Assign / Assigned UX (contacts or project users). */
export type AssignableListRow = Pick<IKanbanAssignee, 'id' | 'name' | 'email' | 'avatarUrl'>;

const ITEM_HEIGHT = 64;

export function kanbanAssignableRowsFromMocks(): AssignableListRow[] {
  return _contacts.map((c) => ({
    id: String(c.id),
    name: c.name,
    email: c.email,
    avatarUrl: c.avatarUrl,
  }));
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Defaults to `_contacts`; pass e.g. `projectAssignPickerRows()` for projects */
  rows?: readonly AssignableListRow[];
  selectedIds: readonly string[];
  onToggle: (id: string) => void;
  /** Dialog title segment before the row count */
  title?: string;
};

export function KanbanContactsDialog({
  open,
  onClose,
  rows: rowsProp,
  selectedIds,
  onToggle,
  title = 'Contacts',
}: Props) {
  const [searchContact, setSearchContact] = useState('');

  useEffect(() => {
    if (!open) setSearchContact('');
  }, [open]);

  const rows = useMemo(() => rowsProp ?? kanbanAssignableRowsFromMocks(), [rowsProp]);

  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => String(id))),
    [selectedIds]
  );

  const handleSearchContacts = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchContact(event.target.value);
  }, []);

  const dataFiltered = useMemo(
    () => applyFilter(rows, searchContact.trim()),
    [rows, searchContact]
  );

  const notFound = !dataFiltered.length && !!searchContact.trim();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0 }}>
        {title} <Typography component="span">({rows.length})</Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchContact}
          onChange={handleSearchContacts}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {notFound ? (
          <SearchNotFound query={searchContact} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {dataFiltered.map((contact) => {
                const idStr = String(contact.id);
                const checked = selectedSet.has(idStr);

                return (
                  <Box
                    component="li"
                    key={idStr}
                    sx={{
                      gap: 2,
                      display: 'flex',
                      height: ITEM_HEIGHT,
                      alignItems: 'center',
                    }}
                  >
                    <PaletteLetterAvatar paletteKey={idStr} displayName={contact.name} />

                    <ListItemText
                      primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
                      secondaryTypographyProps={{ typography: 'caption' }}
                      primary={contact.name}
                      secondary={contact.email}
                    />

                    <Button
                      type="button"
                      size="small"
                      color={checked ? 'primary' : 'inherit'}
                      onClick={() => onToggle(idStr)}
                      startIcon={
                        <Iconify
                          width={16}
                          icon={checked ? 'eva:checkmark-fill' : 'mingcute:add-line'}
                          sx={{ mr: -0.5 }}
                        />
                      }
                    >
                      {checked ? 'Assigned' : 'Assign'}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter(rows: readonly AssignableListRow[], query: string): AssignableListRow[] {
  if (!query) return [...rows];
  const q = query.toLowerCase();
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) || String(r.email).toLowerCase().includes(q)
  );
}
