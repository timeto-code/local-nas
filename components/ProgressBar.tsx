interface Props {
  className?: string;
  background?: string;
  color?: string;
  progress: number;
}

const ProgressBar = ({ className, background, color, progress }: Props) => {
  return (
    <svg className={`h-0.5 w-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill={background || '#f3f3f3'} radius="100%" />
      <rect x="0" y="0" width={`${progress}%`} height="100%" fill={color || '#6da2f8'} radius="100%" />
    </svg>
  );
};

export default ProgressBar;
