import React from 'react';

export const Loading = ({ loading, element }) => {
  return (
    loading ?
      <center>Loading...</center>
      : element
  );
}