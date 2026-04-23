import 'src/global.css';

// ----------------------------------------------------------------------

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { useRealtime } from 'src/infra/realtime';
import { ThemeProvider } from 'src/theme/theme-provider';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { useAuthContext } from 'src/auth/hooks';
import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

function RealtimeBridge() {
  const { user, authenticated } = useAuthContext();
  useRealtime({ token: user?.accessToken, enabled: authenticated });
  return null;
}

export default function App() {
  useScrollToTop();

  return (
    <AuthProvider>
      <SettingsProvider settings={defaultSettings}>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MotionLazy>
              <Snackbar />
              <ProgressBar />
              <SettingsDrawer />
              <RealtimeBridge />
              <Router />
            </MotionLazy>
          </LocalizationProvider>
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
