import { _mock } from './_mock';
import { _userList, _roleUsers } from './_user';

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

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const _projects = [...Array(8)].map((_, index) => {
  const total = 20 + index * 3;
  const completed = Math.min(total, 5 + index * 3);
  const memberCount = 3 + (index % 5);
  const leader = _userList[(index + 1) % _userList.length];
  const status = STATUSES[index];

  return {
    id: _mock.id(index + 20),
    name: _mock.taskNames(index),
    code: `PRJ-${String(1000 + index)}`,
    status,
    createdAt: _mock.time(index + 24),
    startDate: _mock.time(index),
    endDate: _mock.time(index + 5),
    ...(status === 'completed' ? { completionDate: _mock.time(index + 1) } : {}),
    ownerId: _mock.id(index),
    ownerName: _mock.fullName(index),
    projectLeaderId: leader.id,
    projectLeaderName: leader.name,
    members: [...Array(memberCount)].map((__, m) => _mock.id(index + m + 1)),
    // Every 2nd project belongs to the canonical client so the Client role has
    // something to look at. Production code will use the real tenant/client id.
    clientId: index % 2 === 0 ? CLIENT_USER_ID : _mock.id(index + 50),
    clientCompanyName: _userList[(index + 3) % _userList.length].company,
    description: _mock.sentence(index),
    progress: Math.round((completed / total) * 100),
    totalTasks: total,
    completedTasks: completed,
    priority: PRIORITIES[index % PRIORITIES.length],
    isFavorite: index % 3 === 0,
    isTemplate: index === 2 || index === 5,
    isRecurring: index === 1 || index === 4,
    budgetType: ['fixed', 'time_expenses', 'non_billable'][index % 3] as
      | 'fixed'
      | 'time_expenses'
      | 'non_billable',
    budgetHours: 400 + index * 55,
    budgetAmount: 12000 + index * 8250,
    actualHours: 280 + index * 42,
    actualAmount: 9800 + index * 6100,
    dailyHours: 7 + ((index % 4) + 1) * 0.25,
    needsReviewTaskCount: index % 5,
  };
});
