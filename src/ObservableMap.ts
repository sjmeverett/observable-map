import isEqual from 'lodash.isequal';

export type MapObserver<T> = (data: T) => void;

export interface ObservableMapOptions {
  mergeData?: boolean;
}

interface Entry<T> {
  data: T;
  observers: MapObserver<T>[];
}

export class ObservableMap<T = any> {
  public readonly entries = new Map<string, Entry<T>>();

  constructor(private options: ObservableMapOptions = { mergeData: true }) {}

  observe(key: string, observer: MapObserver<T>, data: T) {
    const entry = this.set(key, data, true);
    entry.observers.push(observer);

    return () => {
      entry.observers = entry.observers.filter((x) => x !== observer);

      if (entry.observers.length === 0) {
        this.entries.delete(key);
      }
    };
  }

  set(key: string, data: T, force?: false): Entry<T> | undefined;
  set(key: string, data: T, force: true): Entry<T>;
  set(key: string, data: T, force = false) {
    const entry = this.entries.get(key);

    if (entry) {
      if (data !== null && !isEqual(entry.data, data)) {
        if (
          this.options.mergeData &&
          typeof entry.data === 'object' &&
          entry.data !== null
        ) {
          Object.assign(entry.data, data);
        } else {
          entry.data = data;
        }

        const updated = entry.data;
        entry.observers.forEach((observer) => observer(updated));
      }

      return entry;
    } else if (!force) {
      return;
    }

    const newEntry: Entry<T> = {
      data,
      observers: [],
    };

    this.entries.set(key, newEntry);
    return newEntry;
  }

  get(key: string) {
    return this.entries.get(key)?.data;
  }

  cleanup() {
    for (const [key, entry] of this.entries) {
      if (entry.observers.length === 0) {
        this.entries.delete(key);
      }
    }
  }
}
