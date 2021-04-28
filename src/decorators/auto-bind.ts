// autobind decorator
export function AutoBind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value;
  const bindedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const newMethod = method.bind(this);
      return newMethod;
    },
  };
  return bindedDescriptor;
}
