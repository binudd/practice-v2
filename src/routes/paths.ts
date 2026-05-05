// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    overview: ROOTS.DASHBOARD,
    project: {
      root: `${ROOTS.DASHBOARD}/projects`,
      list: `${ROOTS.DASHBOARD}/projects`,
      new: `${ROOTS.DASHBOARD}/projects/new`,
      /** Create flow with initial flags (template / recurring project). */
      newWithPreset: (preset: 'template' | 'recurring') =>
        `${ROOTS.DASHBOARD}/projects/new?preset=${preset}`,
      /** Template projects — separate module from the main project list. */
      templates: {
        root: `${ROOTS.DASHBOARD}/projects/templates`,
      },
      /** Recurring projects — separate module from the main project list. */
      recurringProjects: {
        root: `${ROOTS.DASHBOARD}/projects/recurring`,
      },
      details: (id: string) => `${ROOTS.DASHBOARD}/projects/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/projects/${id}/edit`,
      kanban: (id: string) => `${ROOTS.DASHBOARD}/projects/${id}/kanban`,
    },
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    timesheet: `${ROOTS.DASHBOARD}/timesheet`,
    settings: `${ROOTS.DASHBOARD}/settings`,
    user: {
      root: `${ROOTS.DASHBOARD}/users`,
      list: `${ROOTS.DASHBOARD}/users`,
      new: `${ROOTS.DASHBOARD}/users/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/users/${id}/edit`,
      /** Current user (all authenticated roles). */
      profile: `${ROOTS.DASHBOARD}/profile`,
      account: `${ROOTS.DASHBOARD}/account`,
    },
    files: `${ROOTS.DASHBOARD}/files`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    mail: `${ROOTS.DASHBOARD}/mail`,
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoices`,
      list: `${ROOTS.DASHBOARD}/invoices`,
      new: `${ROOTS.DASHBOARD}/invoices/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoices/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoices/${id}/edit`,
    },
  },
};
