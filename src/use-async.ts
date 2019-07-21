import { DependencyList, useCallback, useEffect, useState } from 'react';

type AsyncData<TYPE> = {
  isPending: boolean;
  isRejected: boolean;
  isResolved: boolean;
  data?: TYPE;
};

export type AsyncResult<TYPE> = AsyncData<TYPE> & {
  rerun(): void;
};

export default function useAsync<TYPE>(
  source: () => Promise<TYPE>,
  lazy: boolean = false,
  dependencyList?: DependencyList
): AsyncResult<TYPE> {
  const [forceRerun, setForceRerun] = useState(0);
  const [state, setState] = useState<AsyncData<TYPE>>({
    isPending: !lazy,
    isRejected: false,
    isResolved: false,
    data: undefined
  });

  useEffect(
    () => {
      let didCancel = false;

      if (!lazy) {
        setState({ ...state, isPending: true });

        source().then(
          json => {
            if (!didCancel) {
              setState({ isRejected: false, isPending: false, data: json, isResolved: true });
            }
          },
          error => {
            console.error(error);
            if (!didCancel) {
              setState({ isRejected: true, isPending: false, data: undefined, isResolved: false });
            }
          }
        );
      }

      return () => {
        didCancel = true;
      };
      // Alle skal være med, men eslint greier ikke å analysere den
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    dependencyList ? [...dependencyList, forceRerun, lazy] : [source, forceRerun, lazy]
  );

  const rerun = useCallback(() => setForceRerun(forceRerun + 1), [forceRerun]);

  return { ...state, rerun };
}
