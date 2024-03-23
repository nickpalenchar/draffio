import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Draff } from './views/Draff';
import { RandomDraff } from './views/RandomDraff';
import { ChakraProvider, Container } from '@chakra-ui/react';

// ROUTING
const router = createBrowserRouter([
  {
    path: '/',
    Component: () => {
      document.location.href = '/js/new';
      return <div></div>;
    },
  },
  {
    path: '/js',
    element: <RandomDraff />,
  },
  {
    path: '/js/:id',
    element: <Draff />,
  },
]);

function App() {
  window.location.href = '/js/new';
  return (
    <ChakraProvider>
      <div className="App"></div>
    </ChakraProvider>
  );
}

export default App;
