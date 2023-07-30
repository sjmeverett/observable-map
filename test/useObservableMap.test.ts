import { expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useObserve } from '../src/useObservableMap';

it('should return the data', async () => {
  const { result } = renderHook(() => useObserve('a', 'test'));

  expect(result.current).toEqual('test');

  renderHook(() => {
    useObserve('a', 'updated');
  });

  expect(result.current).toEqual('updated');
});
