import type { BoxProps } from '@mui/material/Box';
import type { NavSectionProps } from 'src/components/nav-section';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import InputBase from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog, { dialogClasses } from '@mui/material/Dialog';

import { paths } from 'src/routes/paths';
import { isExternalLink } from 'src/routes/utils';
import { useRouter, usePathname } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';

import { varAlpha } from 'src/theme/styles';
import { useGetProjects } from 'src/actions/project';
import { useFiltersStore, selectScreenFilter } from 'src/store/filters-store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

import { PROJECT_LIST_FILTER_KEY } from 'src/sections/project/project-list-filter-key';

import { useCurrentRole } from 'src/auth/hooks';

import { ResultItem } from './result-item';
import { groupItems, applyFilter, getAllItems } from './utils';

// ----------------------------------------------------------------------

export type SearchbarProps = BoxProps & {
  data?: NavSectionProps['data'];
};

function projectMatchesQuery(
  project: { name: string; code: string; ownerName: string },
  query: string
) {
  const q = query.toLowerCase();
  return (
    project.name.toLowerCase().includes(q) ||
    project.code.toLowerCase().includes(q) ||
    project.ownerName.toLowerCase().includes(q)
  );
}

export function Searchbar({ data: navItems = [], sx, ...other }: SearchbarProps) {
  const theme = useTheme();

  const router = useRouter();
  const pathname = usePathname();

  const role = useCurrentRole();
  const { projects } = useGetProjects({
    scope: role === 'client' ? 'mine' : 'all',
  });

  const isProjectListPage = pathname === paths.dashboard.project.list;

  const projectListFilter = useFiltersStore(selectScreenFilter(PROJECT_LIST_FILTER_KEY));
  const setFilter = useFiltersStore((s) => s.setFilter);

  const search = useBoolean();

  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  useEffect(() => {
    if (!search.value) {
      return;
    }
    if (isProjectListPage) {
      setSearchQuery((projectListFilter.search as string | undefined) ?? '');
    } else {
      setSearchQuery('');
    }
  }, [search.value, isProjectListPage, projectListFilter.search]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'k' && event.metaKey) {
      event.preventDefault();
      search.onToggle();
    }
  };

  useEventListener('keydown', handleKeyDown);

  const handleClick = useCallback(
    (path: string) => {
      if (isExternalLink(path)) {
        window.open(path);
      } else {
        router.push(path);
      }
      handleClose();
    },
    [handleClose, router]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
      if (isProjectListPage) {
        setFilter(PROJECT_LIST_FILTER_KEY, { search: value });
      }
    },
    [isProjectListPage, setFilter]
  );

  const dataFiltered = applyFilter({
    inputData: getAllItems({ data: navItems }),
    query: searchQuery,
  });

  const projectHits = useMemo(() => {
    if (!isProjectListPage || !searchQuery.trim()) {
      return [];
    }
    return projects.filter((p) => projectMatchesQuery(p, searchQuery.trim())).slice(0, 10);
  }, [isProjectListPage, projects, searchQuery]);

  const hasProjectResults = projectHits.length > 0;
  const notFound = Boolean(searchQuery) && !dataFiltered.length && !hasProjectResults;

  const renderNavItems = () => {
    const dataGroups = groupItems(dataFiltered);

    return Object.keys(dataGroups)
      .sort((a, b) => -b.localeCompare(a))
      .map((group, index) => (
        <Box component="ul" key={`${group}-${index}`}>
          {dataGroups[group].map((item) => {
            const { title, path } = item;

            const partsTitle = parse(title, match(title, searchQuery));

            const partsPath = parse(path, match(path, searchQuery));

            return (
              <Box component="li" key={`${title}${path}`} sx={{ display: 'flex' }}>
                <ResultItem
                  path={partsPath}
                  title={partsTitle}
                  groupLabel={searchQuery && group}
                  onClickItem={() => handleClick(path)}
                />
              </Box>
            );
          })}
        </Box>
      ));
  };

  const renderProjectItems = () => {
    if (!hasProjectResults) {
      return null;
    }

    return (
      <Box component="ul" sx={{ mb: dataFiltered.length ? 2 : 0 }}>
        {projectHits.map((project, index) => {
          const title = `${project.name} (${project.code})`;
          const pathLabel = `${project.ownerName} · ${paths.dashboard.project.details(project.id)}`;

          const partsTitle = parse(title, match(title, searchQuery));
          const partsPath = parse(pathLabel, match(pathLabel, searchQuery));

          return (
            <Box component="li" key={project.id} sx={{ display: 'flex' }}>
              <ResultItem
                path={partsPath}
                title={partsTitle}
                groupLabel={searchQuery && index === 0 ? 'Projects' : ''}
                onClickItem={() => handleClick(paths.dashboard.project.details(project.id))}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderButton = (
    <Box
      display="flex"
      alignItems="center"
      onClick={search.onTrue}
      sx={{
        pr: { sm: 1 },
        borderRadius: { sm: 1.5 },
        cursor: { sm: 'pointer' },
        bgcolor: { sm: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
        ...sx,
      }}
      {...other}
    >
      <IconButton disableRipple>
        {/* https://icon-sets.iconify.design/eva/search-fill/ */}
        <SvgIcon sx={{ width: 20, height: 20 }}>
          <path
            fill="currentColor"
            d="m20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8a7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42M5 11a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
          />
        </SvgIcon>
      </IconButton>

      <Label
        sx={{
          fontSize: 12,
          color: 'grey.800',
          bgcolor: 'common.white',
          boxShadow: theme.customShadows.z1,
          display: { xs: 'none', sm: 'inline-flex' },
        }}
      >
        ⌘K
      </Label>
    </Box>
  );

  const inputPlaceholder = isProjectListPage
    ? 'Search projects & navigation…'
    : 'Search…';

  return (
    <>
      {renderButton}

      <Dialog
        fullWidth
        disableRestoreFocus
        maxWidth="sm"
        open={search.value}
        onClose={handleClose}
        transitionDuration={{ enter: theme.transitions.duration.shortest, exit: 0 }}
        PaperProps={{ sx: { mt: 15, overflow: 'unset' } }}
        sx={{ [`& .${dialogClasses.container}`]: { alignItems: 'flex-start' } }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.vars.palette.divider}` }}>
          <InputBase
            fullWidth
            autoFocus
            placeholder={inputPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
            inputProps={{ sx: { typography: 'h6' } }}
          />
        </Box>

        {notFound ? (
          <SearchNotFound query={searchQuery} sx={{ py: 15 }} />
        ) : (
          <Scrollbar sx={{ px: 3, pb: 3, pt: 2, height: 400 }}>
            {renderProjectItems()}
            {renderNavItems()}
          </Scrollbar>
        )}
      </Dialog>
    </>
  );
}
