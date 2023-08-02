import { expect, it, vi } from 'vitest';

interface User {
  name: string;
}

type ObserveCallbackType = (key: string, value: string) => void;

interface ObservableUser extends User {
  observe: (callback: ObserveCallbackType) => void
}

it('should make observable', () => {
  const callMeOnce = vi.fn((key, value) => {console.log('callMeOnce', key, value)});

  function makeObservable(target: User): ObservableUser {
    const callbacks: ObserveCallbackType[] = [];
    const handler = {
      set(target: User, property: keyof User, value: string, receiver: object) {
        console.log('SET', target, property, value, receiver);
        // if (property === 'name') {
        //   // callMeOnce(property, receiver);
        //   target[property] = 'something';
        //   return true;
        // }
        const success = Reflect.set(target, property, value, receiver);
        if (success) {
          callbacks.forEach((callback) => callback(property, value));
        }
        return success;
      },
      observe(callback: ObserveCallbackType) {
        console.log('observe')
        callbacks.push(callback);
      }
    };
    return new Proxy<ObservableUser>({
      ...target,
      observe: (callback: ObserveCallbackType) => {console.log('old observe', callback)}
    }, handler);
  }

  const user: User = { name: 'noname' };
  const observableUser = makeObservable(user);

  observableUser.observe((key: string, value: string) => {
    console.log(`SET ${key}=${value}`);
    callMeOnce(key, value);
  });

  user.name = 'John'; // alerts: SET name=John

  const obj = {
    a: () => {console.log('original a')}
  }
  // const proxy = new Proxy(obj, {a() {console.log('proxy a')}});
  const proxy = new Proxy(obj, {get(target, prop) {console.log('proxy', target, prop); return Reflect.get(target, prop)}});
  proxy.a();

  expect(callMeOnce).toBeCalledWith('name', 'John');

});
