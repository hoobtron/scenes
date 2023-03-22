import { ReducerID } from '@grafana/data';
import {
  EmbeddedScene,
  SceneFlexLayout,
  SceneQueryRunner,
  VizPanel,
  SceneTimeRange,
  SceneTimePicker,
  SceneControlsSpacer,
  SceneRefreshPicker,
  SceneFlexItem,
} from '@grafana/scenes';
import { DATASOURCE_REF } from '../../constants';
import { getRoomTemperatureStatPanel } from './panels';

export function getTemperatureOverviewScene(roomName: string) {
  return new EmbeddedScene({
    $timeRange: new SceneTimeRange({
      from: 'now-12h',
      to: 'now',
    }),
    $data: new SceneQueryRunner({
      datasource: DATASOURCE_REF,
      queries: [getRoomTemperatureQuery(roomName)],
      maxDataPoints: 100,
    }),
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          height: 500,
          children: [
            new VizPanel({
              title: 'Temperature over time',
              pluginId: 'timeseries',

              fieldConfig: {
                defaults: {
                  unit: 'celsius',
                },
                overrides: [],
              },
            }),
          ],
        }),
        new SceneFlexItem({
          flexGrow: 1,
          children: [
            new SceneFlexLayout({
              direction: 'row',
              children: [
                new SceneFlexItem({
                  flexGrow: 1,
                  children: [getRoomTemperatureStatPanel([ReducerID.min])],
                }),
                new SceneFlexItem({
                  flexGrow: 1,
                  children: [getRoomTemperatureStatPanel([ReducerID.max])],
                }),
                new SceneFlexItem({
                  flexGrow: 1,
                  children: [getRoomTemperatureStatPanel([ReducerID.mean])],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    controls: [new SceneControlsSpacer(), new SceneTimePicker({ isOnCanvas: true }), new SceneRefreshPicker({})],
  });
}

export function getHumidityOverviewScene(roomName: string) {
  return new EmbeddedScene({
    $timeRange: new SceneTimeRange({
      from: 'now-12h',
      to: 'now',
    }),
    $data: new SceneQueryRunner({
      datasource: DATASOURCE_REF,
      queries: [getRoomHumidityQuery(roomName)],
      maxDataPoints: 100,
    }),
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          flexGrow: 1,
          children: [
            new VizPanel({
              title: 'Humidity readings over time',
              pluginId: 'timeseries',

              placement: {
                height: 500,
              },
              fieldConfig: {
                defaults: {
                  unit: 'humidity',
                },
                overrides: [],
              },
            }),
          ],
        }),
      ],
    }),
    controls: [new SceneControlsSpacer(), new SceneTimePicker({ isOnCanvas: true }), new SceneRefreshPicker({})],
  });
}

function getRoomTemperatureQuery(roomName: string) {
  return {
    refId: 'Temp',
    datasource: DATASOURCE_REF,
    scenarioId: 'random_walk',
    seriesCount: 1,
    alias: roomName,
    min: 10,
    max: 30,
  };
}

function getRoomHumidityQuery(roomName: string) {
  return {
    refId: 'Humidity',
    datasource: DATASOURCE_REF,
    scenarioId: 'random_walk',
    seriesCount: 1,
    alias: roomName,
    min: 30,
    max: 60,
  };
}
