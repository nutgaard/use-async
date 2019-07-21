import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

export enum Status {
  INIT = 'INIT',
  PENDING = 'PENDING',
  OK = 'OK',
  ERROR = 'ERROR',
  RELOADING = 'RELOADING'
}

export type WithoutData = { status: Status.INIT | Status.PENDING };
export type WithData<TYPE> = { status: Status.OK | Status.RELOADING; data: TYPE };
export type WithError = { status: Status.ERROR; error: any };
type AsyncData<TYPE> = WithoutData | WithData<TYPE> | WithError;

export type AsyncResult<TYPE> = AsyncData<TYPE> & {
  rerun(): void;
};

export function isPending(result: AsyncData<any>): result is WithoutData {
  return [Status.INIT, Status.PENDING].includes(result.status);
}

export function hasData<TYPE>(result: AsyncData<TYPE>): result is WithData<TYPE> {
  return [Status.OK, Status.RELOADING].includes(result.status);
}

export function hasError(result: AsyncData<any>): result is WithError {
  return result.status === Status.ERROR;
}

export default function useAsync<TYPE>(
  source: (isRerun: boolean) => Promise<TYPE>,
  lazy: boolean = false,
  dependencyList?: DependencyList
): AsyncResult<TYPE> {
  const [forceRerun, setForceRerun] = useState(0);
  const lastRerun = useRef(forceRerun);
  const [state, setState] = useState<AsyncData<TYPE>>({
    status: lazy ? Status.INIT : Status.PENDING
  });

  useEffect(
    () => {
      const isRerun = lastRerun.current !== forceRerun;
      lastRerun.current = forceRerun;

      let didCancel = false;

      if (!lazy) {
        if (state.status === Status.OK) {
          setState({ status: Status.RELOADING, data: state.data });
        } else {
          setState({ status: Status.PENDING });
        }

        source(isRerun).then(
          (data) => {
            if (!didCancel) {
              setState({ status: Status.OK, data });
            }
          },
          (error) => {
            console.error(error);
            if (!didCancel) {
              setState({ status: Status.ERROR, error });
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

  const rerun = useCallback(() => setForceRerun(forceRerun + 1), [setForceRerun, forceRerun]);

  return { ...state, rerun };
}
