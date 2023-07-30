import { expect, it, vi } from 'vitest';
import { ObservableMap } from '../src/ObservableMap';

it('updates observers properly', () => {
  const map = new ObservableMap();
  const cb1 = vi.fn();
  const cb2 = vi.fn();
  const cb3 = vi.fn();

  map.observe('a', cb1, '1');
  map.observe('b', cb2, '2');
  map.observe('a', cb3, '3');

  expect(cb1).toHaveBeenCalledWith('3');
  expect(cb2).not.toHaveBeenCalled();
  expect(cb3).not.toHaveBeenCalled();

  map.set('a', '4');
  expect(cb1).toHaveBeenCalledWith('4');
  expect(cb3).toHaveBeenCalledWith('4');
});

it('can merge data', () => {
  const map = new ObservableMap({ mergeData: true });
  let updated = null;

  const cb = vi.fn().mockImplementation((data) => {
    updated = data;
  });

  const obj = { data: 'test' };
  map.observe('a', cb, obj);
  map.set('a', { data: 'updated' });

  expect(cb).toHaveBeenCalledWith({ data: 'updated' });
  expect(updated).toBe(obj);
});

it('unsubscribes and deletes request', () => {
  const map = new ObservableMap();

  const u1 = map.observe('a', () => {}, null);
  const u2 = map.observe('a', () => {}, null);
  map.observe('b', () => {}, null);

  expect(map.entries.size).toBe(2);
  expect(map.entries.get('a')?.observers).toHaveLength(2);
  u1();
  expect(map.entries.get('a')?.observers).toHaveLength(1);
  u2();
  expect(map.entries.size).toBe(1);
});
