'use client';

import React from 'react';
import { GraphingCanvas } from '../../components/graphing/GraphingCanvas';
import type { Point, FunctionPlot } from '../../components/graphing/GraphingCanvas';
import type { MathPrimitiveProps } from '../types';

export interface CoordinatePlaneValue {
  points: Point[];
}

export interface CoordinatePlaneConfig {
  domain?: [number, number];
  range?: [number, number];
  functions?: FunctionPlot[];
  snapToGrid?: boolean;
  width?: number;
  height?: number;
}

export type CoordinatePlaneProps =
  MathPrimitiveProps<CoordinatePlaneValue> & CoordinatePlaneConfig;

function pointLabel(p: Point): string {
  return p.label ?? `${p.x.toFixed(1)}, ${p.y.toFixed(1)}`;
}

export function CoordinatePlane({
  value,
  onChange,
  mode = 'interactive',
  disabled = false,
  domain = [-10, 10],
  range = [-10, 10],
  functions = [],
  snapToGrid = false,
  width = 600,
  height = 600,
}: CoordinatePlaneProps) {
  const interactive = mode === 'interactive' && !disabled;
  const readonly = !interactive;

  const labeledPoints = value.points.map((p) => ({
    ...p,
    label: pointLabel(p),
  }));

  return (
    <GraphingCanvas
      domain={domain}
      range={range}
      functions={functions}
      points={labeledPoints}
      snapToGrid={snapToGrid}
      width={width}
      height={height}
      readonly={readonly}
      onPointAdd={
        interactive && onChange
          ? (p) =>
              onChange({
                points: [...value.points, { ...p, label: pointLabel(p) }],
              })
          : undefined
      }
      onPointRemove={
        interactive && onChange
          ? (label) =>
              onChange({
                points: value.points.filter(
                  (pt) => pointLabel(pt) !== label,
                ),
              })
          : undefined
      }
    />
  );
}
