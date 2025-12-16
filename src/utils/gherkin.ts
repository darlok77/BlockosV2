/* eslint-disable @typescript-eslint/no-explicit-any */

export type CreateGherkinRunnerParams = {
  given: Record<string, (...payload: any[]) => any>;
  when: Record<string, (...payload: any[]) => any>;
  then: Record<string, (...payload: any[]) => any>;
};

export type CreateGherkinRunnerOptions = {
  beforeExecute?: (text: string) => void;
};

export function createGherkinRunner<T extends CreateGherkinRunnerParams>(
  params: T,
  options: CreateGherkinRunnerOptions = {},
) {
  const { beforeExecute } = options;

  type GivenString = keyof T['given'];
  type WhenString = keyof T['when'];
  type ThenString = keyof T['then'];

  function given<Name extends GivenString>(
    name: Name & string,
    ...payload: Parameters<T['given'][Name]>
  ): ReturnType<T['given'][Name]> {
    if (beforeExecute) {
      beforeExecute(name);
    }

    return params.given[name](...payload);
  }

  function when<Name extends WhenString>(
    name: Name & string,
    ...payload: Parameters<T['when'][Name]>
  ): ReturnType<T['when'][Name]> {
    if (beforeExecute) {
      beforeExecute(name);
    }

    return params.when[name](...payload);
  }

  function then<Name extends ThenString>(
    name: Name & string,
    ...payload: Parameters<T['then'][Name]>
  ): ReturnType<T['then'][Name]> {
    if (beforeExecute) {
      beforeExecute(name);
    }

    return params.then[name](...payload);
  }

  return {
    given,
    when,
    then,
  };
}
