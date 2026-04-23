import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ProjectEditView } from 'src/sections/project/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit project | ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams<{ id: string }>();

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <ProjectEditView id={id} />
    </>
  );
}
