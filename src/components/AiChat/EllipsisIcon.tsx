import * as React from "react"
import type { FC } from "react"

type EllipsisIconProps = {
  className?: string
}

const EllipsisIcon: FC<EllipsisIconProps> = ({ className }) => (
  <svg
    viewBox="0 -10 100 40"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse cx="20" cy="15" rx="8" ry="8" fill="#000">
      <animate
        attributeName="cy"
        values="15;4;15;15"
        dur="1.2s"
        keyTimes="0;0.3;0.6;1"
        keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
        calcMode="spline"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
      <animate
        attributeName="ry"
        values="8;8;7;8;8"
        dur="1.2s"
        keyTimes="0;0.52;0.6;0.7;1"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
      <animate
        attributeName="rx"
        values="8;8;9;8;8"
        dur="1.2s"
        keyTimes="0;0.52;0.6;0.7;1"
        repeatCount="indefinite"
        begin="0s"
      ></animate>
    </ellipse>
    <ellipse cx="50" cy="15" rx="8" ry="8" fill="#000">
      <animate
        attributeName="cy"
        values="15;4;15;15"
        dur="1.2s"
        keyTimes="0;0.3;0.6;1"
        keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
        calcMode="spline"
        repeatCount="indefinite"
        begin="0.2s"
      ></animate>
      <animate
        attributeName="ry"
        values="8;8;7;8;8"
        dur="1.2s"
        keyTimes="0;0.52;0.6;0.7;1"
        repeatCount="indefinite"
        begin="0.2s"
      ></animate>
      <animate
        attributeName="rx"
        values="8;8;9;8;8"
        dur="1.2s"
        keyTimes="0;0.52;0.6;0.7;1"
        repeatCount="indefinite"
        begin="0.2s"
      ></animate>
    </ellipse>
    <ellipse cx="80" cy="15" rx="8" ry="8" fill="#000">
      <animate
        attributeName="cy"
        values="15;4;15;15"
        dur="1.2s"
        keyTimes="0;0.3;0.6;1"
        keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
        calcMode="spline"
        repeatCount="indefinite"
        begin="0.4s"
      ></animate>
      <animate
        attributeName="ry"
        values="8;8;7;8;8"
        dur="1.2s"
        keyTimes="0;0.52;0.6;0.7;1"
        repeatCount="indefinite"
        begin="0.4s"
      ></animate>
      <animate
        attributeName="rx"
        values="8;8;9;8;8"
        dur="1.2s"
        keyTimes="0;0.52;0.6;0.7;1"
        repeatCount="indefinite"
        begin="0.4s"
      ></animate>
    </ellipse>
  </svg>
)

export default EllipsisIcon
