import React, { useEffect, useState, useCallback } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import axios from 'axios';
import Highcharts from 'highcharts';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/accessibility';

interface Props extends PanelProps<SimpleOptions> {}

interface PanelStyles {
  wrapper: string;
  chartContainer: string;
  legendContainer: string;
  legendItem: string;
  legendColorBox: string;
}
const getStyles = () => {
  const styles: PanelStyles = {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    chartContainer: css`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80%;
      display: flex;
      justify-content: center;
      align-items: center;
    `,
    legendContainer: css`
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
    `,
    legendItem: css`
      display: flex;
      align-items: center;
      margin-right: 10px;
      margin-bottom: 5px;
    `,
    legendColorBox: css`
      width: 20px;
      height: 20px;
      margin-right: 5px;
    `,
  };

  return styles;
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = useStyles2(getStyles);
  const [tennisData, setTennisData] = useState<any[]>([]);

  const totalGrandSlam = tennisData.reduce((total, item) => total + item.most_grand_slam, 0);

  const seriesData = tennisData.map((item) => ({
    name: item.country,
    y: (item.most_grand_slam / totalGrandSlam) * 100,
  }));

  const loadHighcharts = useCallback(() => {
    if (typeof Highcharts !== 'undefined') {
      // @ts-ignore
      Highcharts.chart('container', {
        chart: {
          type: 'pie',
        },
        title: {
          text: 'Distribución de Most Grand Slam por país',
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            },
          },
        },
        series: [
          {
            name: 'Most Grand Slam',
            colorByPoint: true,
            data: seriesData,
          },
        ],
      });
    }
  }, [seriesData]);
  useEffect(() => {
    axios
      .get('http://antoniosaborido.es/api/v2/tennis')
      .then((response) => {
        setTennisData(response.data);
      })
      .catch((error) => {
        console.error('Error al cargar los datos:', error);
      });
  }, []);

  useEffect(() => {
    if (seriesData.length > 0) {
      loadHighcharts();
    }
  }, [seriesData, loadHighcharts]);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <div id="container" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};
