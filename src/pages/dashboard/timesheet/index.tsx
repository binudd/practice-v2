import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TimesheetView } from 'src/sections/timesheet/view';

// ----------------------------------------------------------------------

const metadata = { title: `Timesheet | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <TimesheetView />
    </>
  );
}
