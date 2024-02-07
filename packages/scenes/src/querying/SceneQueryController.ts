import { SceneObjectBase } from '../core/SceneObjectBase';
import { SceneObject, SceneObjectState, SceneStatelessBehavior } from '../core/types';
import { DataQueryRequest } from '@grafana/data';
import { LoadingState } from '@grafana/schema';

export interface SceneQueryStateControllerState extends SceneObjectState {
  isRunning: boolean;
}

export interface SceneQueryControllerLike extends SceneObject<SceneQueryStateControllerState> {
  isQueryController: true;
  cancelAll(): void;

  queryStarted(entry: SceneQueryControllerEntry): void;
  queryCompleted(entry: SceneQueryControllerEntry): void;
}

export function isQueryController(s: SceneObject | SceneStatelessBehavior): s is SceneQueryControllerLike {
  return 'isQueryController' in s;
}

export type SceneQueryType = 'data' | 'annotations' | 'panel' | 'variable' | 'alerts';

export interface QueryResultWithState {
  state: LoadingState;
}

export interface SceneQueryControllerEntry {
  request?: DataQueryRequest;
  type: SceneQueryType;
  origin: SceneObject;
  cancel?: () => void;
}

export class SceneQueryController
  extends SceneObjectBase<SceneQueryStateControllerState>
  implements SceneQueryControllerLike
{
  public isQueryController: true = true;

  #running = new Set<SceneQueryControllerEntry>();

  public constructor(state: Partial<SceneQueryStateControllerState>) {
    super({ isRunning: state.isRunning ?? false });
  }

  public queryStarted(entry: SceneQueryControllerEntry) {
    this.#running.add(entry);

    if (!this.state.isRunning) {
      this.setState({ isRunning: true });
    }
  }

  public queryCompleted(entry: SceneQueryControllerEntry) {
    this.#running.delete(entry);

    if (this.#running.size === 0) {
      this.setState({ isRunning: false });
    }
  }

  public cancelAll() {
    for (const entry of this.#running.values()) {
      entry.cancel?.();
    }
  }
}
