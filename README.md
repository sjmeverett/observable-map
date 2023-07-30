# @sjmeverett/observable-map

Keep data consistent across your React app.

## The problem

If you're writing a React app, you might want to make sure that everywhere you show a piece of data, it's consistent. And even if you're not sure if you're showing it at all, you'll still want to make sure you update it everywhere it might be.

## Installation

```
npm install @sjmeverett/observable-map
```

## Usage

The simplest way to use this library is with the `useObserve` hook.

It takes two arguments: `key` and `data`, and it returns the data.

```tsx
import { useObserve } from '@sjmeverett/observable-map';

export const MyComponent = ({ person }) => {
  const observed = useObserve(person.id, person);

  return (
    <div>
      <div>{observed.name}</div>
      <div>{observed.phone}</div>
    </div>
  );
};
```

Anywhere else you use the hook with the same `key`, the hook will make sure everyone gets the same version of `data`.

The most recent `useObserve` to render with a given `key` wins, and the other ones are updated to use that value (it uses `setState` internally).

If you render two `useHooks` with the same `key` and the same deeply-equal value for `data`, it's smart enough to not update the state.

You can also use it with primitive ("scalar") values if you like:

```tsx
const observedOnlineCount = useObserve('onlineCount', response.onlineCount);
```

## Using a specific map instance

The `useObserve` hook uses the `ObservableMap` class underneath. By default, it uses a shared instance, so all uses of the hook will share the same data. If you want to isolate some of the data, or you want to specify non-default options for the `ObservableMap` class, you can use the `ObservableMapProvider` component:

```tsx
import {
  ObservableMap,
  ObservableMapProvider,
} from '@sjmeverett/observable-map';

const map = new ObservableMap();

const App = () => {
  return <ObservableMapProvider value={map}>{/* ... */}</ObservableMapProvider>;
};
```

## Data merging

Note that by default, for non-primitive values, it merges whatever existing value it has with the new value. This means that all versions of the data will be reference equal (unless you set it to `null` or a primitive value and then to something else again). It also means that you can still use this library if your API returns subsets of the same data in certain cases.

For example, let's say you've fetched the full user object for the currently-logged in user, and also a list of comments for a blog post. Those blog posts might have a subset of user objects for their authors, for example just the name. You wouldn't want to overwrite your full user object with only the user's name, but you _would_ want to show the same value for the user's name everywhere. The default behavior allows this.

Note that if the presence or not of a field in your data is meaningful, for example if you use `mongodb` on your server and deliberately `unset` a field, you _cannot use this behavior_, as the lack of field in the incoming data _will not_ overwrite the field value in the old data.

To opt out, you can pass `{ mergeData: false }` as an option to the constructor of `ObservableMap`:

```tsx
import {
  ObservableMap,
  ObservableMapProvider,
} from '@sjmeverett/observable-map';

const map = new ObservableMap({ mergeData: false });

const App = () => {
  return <ObservableMapProvider value={map}>{/* ... */}</ObservableMapProvider>;
};
```

## Getting the map instance

You can grab the map instance from context by using the `useObservableMap` hook:

```tsx
import { useObservableMap } from '@sjmeverett/observable-map';

const MyComponent = () => {
  const map = useObservableMap();
};
```

## Updating values manually

You might want to update values without necessarily showing them in a component. For example, you might want to feed your API responses through the map, so that if anything is observing that object it will be updated. It is a common convention for update API calls to return the updated object, so we can use that to update the UI without unneccesarily refetching the data.

You can use the `set` method of `ObservableMap` to update the UI everywhere the object is shown:

```tsx
import { useObservableMap } from '@sjmeverett/observable-map';

const MyComponent = () => {
  const map = useObservableMap();

  const markAsDone = async () => {
    const result = await todoApi.markTodoAsDone();
    map.set(result.todo.id, result.todo);
  };

  return <button onClick={markAsDone}>Complete</button>;
};
```

Note that if the given key isn't currently being observed, the `set` method won't do anything, so you can call it for data without caring if it's currently being shown or not, on the off chance that it is being shown.

## The `observe` method

If for some reason you want to use the `observe` method directly rather than using the `useObserve` hook, you can. It takes three arguments: `key`, `observer`, and `data`. It returns a function which takes no arguments and which unregisters the observer:

```tsx
const map = new ObservableMap();
const [state, setState] = useState(data);

useEffect(() => {
  const unsubscribe = map.observe(data.id, setState, data);

  return () => {
    unsubscribe();
  };
}, [data]);
```

## Contributing

If you notice a bug, please file an issue!
