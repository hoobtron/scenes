import React, { useEffect } from 'react';
import { SceneContextProvider, SceneContextProviderProps } from './SceneContextProvider';
import { SceneContextObject } from './SceneContextObject';
import { useSceneContext } from './hooks';
import { RenderResult, render } from '@testing-library/react';
import { SceneQueryController } from '../behaviors';

describe('SceneContextProvider', () => {
  it('Should activate on mount', () => {
    const s = setup({});

    expect(s.context?.isActive).toBe(true);
  });

  it('Should deactivate on unmount', () => {
    const s = setup({ timeRange: { from: '1m-now', to: 'now' }, withQueryController: true });

    s.renderResult.unmount();
    expect(s.context?.isActive).toBe(false);
  });

  it('Should set time range and query controller', () => {
    const s = setup({ timeRange: { from: '1m-now', to: 'now' }, withQueryController: true });

    expect(s.context!.state.$timeRange?.state.from).toBe('1m-now');
    expect(s.context!.state.$behaviors?.[0]).toBeInstanceOf(SceneQueryController);
  });

  it('Can nest', () => {
    let ctx: SceneContextObject | undefined;

    render(
      <SceneContextProvider>
        <SceneContextProvider>
          <ChildTest setCtx={(c) => (ctx = c)}></ChildTest>
        </SceneContextProvider>
      </SceneContextProvider>
    );

    expect(ctx?.parent).toBeDefined();
  });
});

interface ChildTestProps {
  setCtx: (ctx: SceneContextObject) => void;
  children?: React.ReactNode;
}

function ChildTest({ setCtx, children }: ChildTestProps) {
  const ctx = useSceneContext();

  useEffect(() => {
    setCtx(ctx);
  }, [ctx, setCtx]);

  return children;
}

interface SetupResult {
  context?: SceneContextObject;
  renderResult: RenderResult;
}

interface SetupProps extends Partial<SceneContextProviderProps> {}

function setup(props: SetupProps) {
  const result: SetupResult = {} as SetupResult;

  result.renderResult = render(
    <SceneContextProvider {...props}>
      <ChildTest setCtx={(c) => (result.context = c)}></ChildTest>
    </SceneContextProvider>
  );

  return result;
}
