import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
export type AsyncData<TYPE> = WithoutData | WithData<TYPE> | WithError;

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
  dependencyList?: DependencyList,
  initialState?: AsyncData<TYPE>
): AsyncResult<TYPE> {
  const isCancelled = useRef(false);
  const [rerunValue, setRerunValue] = useState(0);
  const lastRerun = useRef(rerunValue);
  const [state, setState] = useState<AsyncData<TYPE>>(
    initialState || {
      status: lazy ? Status.INIT : Status.PENDING
    }
  );

  useEffect(
    () => {
      const isRerun = lastRerun.current !== rerunValue;
      lastRerun.current = rerunValue;

      if (!lazy || (isRerun && ![Status.PENDING, Status.RELOADING].includes(state.status))) {
        if (state.status === Status.OK) {
          setState({ status: Status.RELOADING, data: state.data });
        } else {
          setState({ status: Status.PENDING });
        }

        source(isRerun).then(
          (data) => {
            if (!isCancelled.current) {
              setState({ status: Status.OK, data });
            }
          },
          (error) => {
            console.error(error);
            if (!isCancelled.current) {
              setState({ status: Status.ERROR, error });
            }
          }
        );
      }
      // Alle skal være med, men eslint greier ikke å analysere den
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    dependencyList
      ? [...dependencyList, rerunValue, lazy, isCancelled]
      : [source, rerunValue, lazy, isCancelled]
  );

  useEffect(() => {
    return () => {
      isCancelled.current = true;
    };
  }, [isCancelled]);

  const rerun = useCallback(() => {
    setRerunValue((v) => v + 1);
  }, []);

  return useMemo(() => ({ ...state, rerun }), [state, rerun]);
}
