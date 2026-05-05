import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseCollapseNavOptions = {
  /** When true, the desktop details column starts collapsed (e.g. embedded discussion). */
  defaultCollapseDesktop?: boolean;
};

export type UseNavCollapseReturn = {
  collapseDesktop: boolean;
  onCloseDesktop: () => void;
  onCollapseDesktop: () => void;
  openMobile: boolean;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
};

export function useCollapseNav(options?: UseCollapseNavOptions): UseNavCollapseReturn {
  const [openMobile, setOpenMobile] = useState(false);

  const [collapseDesktop, setCollapseDesktop] = useState(
    options?.defaultCollapseDesktop ?? false
  );

  const onCollapseDesktop = useCallback(() => {
    setCollapseDesktop((prev) => !prev);
  }, []);

  const onCloseDesktop = useCallback(() => {
    setCollapseDesktop(false);
  }, []);

  const onOpenMobile = useCallback(() => {
    setOpenMobile(true);
  }, []);

  const onCloseMobile = useCallback(() => {
    setOpenMobile(false);
  }, []);

  return {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  };
}
