import { act, renderHook } from '@testing-library/react-hooks';
import useAsync, { hasData, hasError, isPending, Status } from '../src/use-async';

describe('use-async', () => {
  const successSource = () => Promise.resolve('data');
  const failureSource = () => Promise.reject('error');

  it('initialState', () => {
    const renderer = renderHook(() => useAsync(successSource));
    const result = renderer.result.current;

    expect(result.status).toBe(Status.PENDING);
  });

  it('initialState lazy', () => {
    const renderer = renderHook(() => useAsync(successSource, true));
    const result = renderer.result.current;

    expect(result.status).toBe(Status.INIT);
  });

  it('reports success', (done) => {
    const renderer = renderHook(() => useAsync(successSource));

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.status).toBe(Status.OK);

      if (result.status === Status.OK) {
        expect(result.data).toBe('data');
      }
      done();
    }, 50);
  });

  it('reports failure', (done) => {
    const renderer = renderHook(() => useAsync(failureSource));

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.status).toBe(Status.ERROR);

      if (result.status === Status.ERROR) {
        expect(result.error).toBe('error');
      }
      done();
    }, 50);
  });

  it('reports reloading', (done) => {
    const spySource = jest.fn().mockReturnValue(successSource());
    const renderer = renderHook(() => useAsync(spySource));

    setTimeout(() => {
      const result = renderer.result.current;
      act(() => result.rerun());
      expect(renderer.result.current.status).toBe(Status.RELOADING);
    }, 50);

    setTimeout(() => {
      expect(spySource).toBeCalledTimes(2);
      expect(spySource.mock.calls).toEqual([[false], [true]]);
      expect(renderer.result.current.status).toBe(Status.OK);
      done();
    }, 100);
  });

  it('run on rerun even if lazy', (done) => {
    const spySource = jest.fn().mockReturnValue(successSource());
    const renderer = renderHook(() => useAsync(spySource, true));

    setTimeout(() => {
      const result = renderer.result.current;
      act(() => result.rerun());
      expect(renderer.result.current.status).toBe(Status.PENDING);
    }, 50);

    setTimeout(() => {
      expect(spySource).toBeCalledTimes(1);
      expect(spySource.mock.calls).toEqual([[true]]);
      expect(renderer.result.current.status).toBe(Status.OK);
      done();
    }, 100);
  });

  it('rerendering should not call source', (done) => {
    const spySource = jest.fn().mockReturnValue(successSource());
    const renderer = renderHook(() => useAsync(spySource));

    act(() => renderer.rerender());

    setTimeout(() => {
      expect(spySource).toBeCalledTimes(1);
      done();
    }, 50);
  });

  it('unmount should prevent state update', (done) => {
    const renderer = renderHook(() => useAsync(successSource));
    renderer.unmount();

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.status).toBe(Status.PENDING);
      done();
    }, 50);
  });

  it('unmount should prevent state update', (done) => {
    const renderer = renderHook(() => useAsync(failureSource));
    renderer.unmount();

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.status).toBe(Status.PENDING);
      done();
    }, 50);
  });

  it('use provided dependencyList', (done) => {
    const renderer = renderHook(() => useAsync(successSource, false, [1]));

    setTimeout(() => {
      const result = renderer.result.current;

      expect(result.status).toBe(Status.OK);
      if (result.status === Status.OK) {
        expect(result.data).toBe('data');
      }
      done();
    }, 50);
  });

  it('is pending for INIT and PENDING state', () => {
    expect(isPending({ status: Status.INIT })).toBe(true);
    expect(isPending({ status: Status.PENDING })).toBe(true);
    expect(isPending({ status: Status.OK, data: '' })).toBe(false);
    expect(isPending({ status: Status.RELOADING, data: '' })).toBe(false);
    expect(isPending({ status: Status.ERROR, error: '' })).toBe(false);
  });

  it('is has data for OK and RELOADING state', () => {
    expect(hasData({ status: Status.INIT })).toBe(false);
    expect(hasData({ status: Status.PENDING })).toBe(false);
    expect(hasData({ status: Status.OK, data: '' })).toBe(true);
    expect(hasData({ status: Status.RELOADING, data: '' })).toBe(true);
    expect(hasData({ status: Status.ERROR, error: '' })).toBe(false);
  });

  it('is has error for ERROR state', () => {
    expect(hasError({ status: Status.INIT })).toBe(false);
    expect(hasError({ status: Status.PENDING })).toBe(false);
    expect(hasError({ status: Status.OK, data: '' })).toBe(false);
    expect(hasError({ status: Status.RELOADING, data: '' })).toBe(false);
    expect(hasError({ status: Status.ERROR, error: '' })).toBe(true);
  });
});
