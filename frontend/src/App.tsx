import React from 'react';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
} from 'react-router-dom';
import {
  ChakraProvider,
  extendBaseTheme,
  theme as chakraTheme,
} from '@chakra-ui/react';
import { Draff } from './views/Draff';
import { RandomDraff } from './views/RandomDraff';

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
  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;
