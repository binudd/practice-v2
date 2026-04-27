import { _mock } from './_mock';
import { _roleUsers } from './_user';

// ----------------------------------------------------------------------

export const PROJECT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

// The canonical "client" user id used to scope projects for Client role demos.
const CLIENT_USER_ID = _roleUsers.client.id;

const STATUSES: Array<'active' | 'on-hold' | 'completed' | 'archived'> = [
  'active',
  'active',
  'on-hold',
  'active',
  'completed',
  'active',
  'on-hold',
  'archived',
];

const PRIORITIES = ['low', 'medium', 'high'] as const;

export const _projects = [...Array(8)].map((_, index) => {
  const total = 20 + index * 3;
  const completed = Math.min(total, 5 + index * 3);
  const memberCount = 3 + (index % 5);

  return {
    id: _mock.id(index + 20),
    name: _mock.taskNames(index),
    code: `PRJ-${String(1000 + index)}`,
    status: STATUSES[index],
    startDate: _mock.time(index),
    endDate: _mock.time(index + 5),
    ownerId: _mock.id(index),
    ownerName: _mock.fullName(index),
    members: [...Array(memberCount)].map((__, m) => _mock.id(index + m + 1)),
    // Every 2nd project belongs to the canonical client so the Client role has
    // something to look at. Production code will use the real tenant/client id.
    clientId: index % 2 === 0 ? CLIENT_USER_ID : _mock.id(index + 50),
    description: _mock.sentence(index),
    progress: Math.round((completed / total) * 100),
    totalTasks: total,
    completedTasks: completed,
    priority: PRIORITIES[index % PRIORITIES.length],
    isFavorite: index % 3 === 0,
  };
});
