import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ProjectCreateView } from 'src/sections/project/view';

// ----------------------------------------------------------------------

const metadata = { title: `New project | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <ProjectCreateView />
    </>
  );
}
