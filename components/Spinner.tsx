import React from 'react';
import sytles from '../styles/Spinner.module.scss';

const Circle = () => {
  return (
    <svg className={sytles.spinner} width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <circle className={sytles.path} fill="none" strokeWidth="5" strokeLinecap="round" cx="33" cy="33" r="20"></circle>
    </svg>
  );
};

export default Circle;
