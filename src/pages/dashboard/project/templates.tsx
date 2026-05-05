import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ProjectListView } from 'src/sections/project/view';

// ----------------------------------------------------------------------

const metadata = { title: `Templates | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <ProjectListView moduleHub="templates" />
    </>
  );
}
