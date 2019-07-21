import { renderHook } from '@testing-library/react-hooks';
import useAsync from '../src/use-async';

describe('use-async', () => {
  const successSource = () => Promise.resolve('data');
  const failureSource = () => Promise.reject('error');

  it('initialState', () => {
    const renderer = renderHook(() => useAsync(successSource));
    const result = renderer.result.current;

    expect(result.isPending).toBe(true);
    expect(result.isRejected).toBe(false);
    expect(result.isResolved).toBe(false);
    expect(result.data).toBeUndefined();
  });

  it('initialState lazy', () => {
    const renderer = renderHook(() => useAsync(successSource, true));
    const result = renderer.result.current;

    expect(result.isPending).toBe(false);
    expect(result.isRejected).toBe(false);
    expect(result.isResolved).toBe(false);
    expect(result.data).toBeUndefined();
  });

  it('reports success', done => {
    const renderer = renderHook(() => useAsync(successSource));

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.isPending).toBe(false);
      expect(result.isRejected).toBe(false);
      expect(result.isResolved).toBe(true);
      expect(result.data).toBe('data');
      done();
    }, 50);
  });

  it('reports failure', done => {
    const renderer = renderHook(() => useAsync(failureSource));

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.isPending).toBe(false);
      expect(result.isRejected).toBe(true);
      expect(result.isResolved).toBe(false);
      expect(result.data).toBeUndefined();
      done();
    }, 50);
  });

  it('unmount should prevent state update', done => {
    const renderer = renderHook(() => useAsync(successSource));
    renderer.unmount();

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.isPending).toBe(true);
      expect(result.isRejected).toBe(false);
      expect(result.isResolved).toBe(false);
      expect(result.data).toBeUndefined();
      done();
    }, 50);
  });

  it('unmount should prevent state update', done => {
    const renderer = renderHook(() => useAsync(failureSource));
    renderer.unmount();

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.isPending).toBe(true);
      expect(result.isRejected).toBe(false);
      expect(result.isResolved).toBe(false);
      expect(result.data).toBeUndefined();
      done();
    }, 50);
  });

  it('use provided dependencyList', done => {
    const renderer = renderHook(() => useAsync(successSource, false, [1]));

    setTimeout(() => {
      const result = renderer.result.current;
      expect(result.isPending).toBe(false);
      expect(result.isRejected).toBe(false);
      expect(result.isResolved).toBe(true);
      expect(result.data).toBe('data');
      done();
    }, 50);
  });
});
