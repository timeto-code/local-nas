import React from 'react';
import sytles from '@/styles/Spinner.module.scss';

interface CircleProps {
  width?: number;
  height?: number;
  radius?: number;
  storkWidth?: number;
  duration?: number;
  colors?: string[];
}

const Circle = ({
  width = 100,
  height = 100,
  radius = 20,
  storkWidth = 5,
  duration = 1.4,
  colors = ['#4285F4', '#DE3E35', '#F7C223', '#1B9A59'],
}: CircleProps) => {
  const [color1, color2, color3, color4] = colors;

  return (
    <div
      style={
        {
          '--offset': radius * 2 * Math.PI,
          '--offsetMid': (radius * 2 * Math.PI) / 4,
          '--duration': duration + 's',
          '--duration-color': duration * 2 + 's',
          '--color-1': color1,
          '--color-2': color2,
          '--color-3': color3,
          '--color-4': color4,
        } as React.CSSProperties
      }
    >
      <svg
        className={sytles.spinner}
        width={width + 'px'}
        height={height + 'px'}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={sytles.path}
          fill="none"
          strokeWidth={storkWidth}
          strokeLinecap="round"
          cx={width / 2}
          cy={height / 2}
          r={radius}
        ></circle>
      </svg>
    </div>
  );
};

export default Circle;
