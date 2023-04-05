import {
  VizPanel,
  SceneTimePicker,
  SceneFlexLayout,
  SceneTimeRange,
  EmbeddedScene,
  SceneFlexItem,
  SceneAppPage,
  SceneRefreshPicker,
} from '@grafana/scenes';
import { demoUrl } from '../utils/utils.routing';
import { getQueryRunnerWithRandomWalkQuery } from './utils';

export function getDynamicPageDemo(): SceneAppPage {
  const defaultTabs = [getSceneAppPage('', 'Temperature')];

  const page = new SceneAppPage({
    title: 'Dynamic page',
    subTitle: 'Dynamic tabs, and drilldowns. Adds a tab with drilldown after 2 seconds.',
    url: `${demoUrl('dynamic-page')}`,
    controls: [new SceneTimePicker({ isOnCanvas: true }), new SceneRefreshPicker({ isOnCanvas: true })],
    tabs: defaultTabs,
  });

  page.addActivationHandler(() => {
    if (page.state.tabs!.length === 1) {
      const cancel = setTimeout(() => {
        page.setState({
          tabs: [...defaultTabs, getSceneAppPage('/tab2', 'Humidity')],
        });
      }, 2000);
      return () => clearTimeout(cancel);
    }

    return;
  });

  return page;
}

function getSceneAppPage(url: string, name: string) {
  return new SceneAppPage({
    title: name,
    url: `${demoUrl('dynamic-page')}${url}`,
    getScene: () => {
      return new EmbeddedScene({
        body: new SceneFlexLayout({
          direction: 'column',
          children: [
            new SceneFlexItem({
              body: new VizPanel({
                key: '3',
                pluginId: 'timeseries',
                title: name,
              }),
            }),
          ],
        }),
        $timeRange: new SceneTimeRange(),
        $data: getQueryRunnerWithRandomWalkQuery(),
      });
    },
    drilldowns: [],
  });
}
