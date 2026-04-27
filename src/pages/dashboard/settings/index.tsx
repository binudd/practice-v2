import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/settings';

// ----------------------------------------------------------------------

const metadata = { title: `Settings | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <SettingsView />
    </>
  );
}
