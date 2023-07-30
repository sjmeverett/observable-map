import { createContext, useContext, useEffect, useState } from 'react';
import { ObservableMap } from './ObservableMap';

const context = createContext(new ObservableMap());
export const ObservableMapProvider = context.Provider;

export function useObservableMap() {
  return useContext(context);
}

export function useObserve<T>(key: string, data: T) {
  const map = useObservableMap();
  const [state, setState] = useState<T>(data);

  useEffect(() => {
    return map.observe(key, setState, data);
  }, [key, data]);

  return state;
}
