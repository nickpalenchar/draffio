import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Draff } from './views/Draff';
import {
  extendBaseTheme,
  theme as chakraTheme,
  ChakraProvider,
} from '@chakra-ui/react';
const { Button, Tabs, Input, Container, Card, Modal, Heading, Alert, Tag } =
  chakraTheme.components;
const theme = extendBaseTheme({
  components: {
    Button,
    Tabs,
    Input,
    Container,
    Card,
    Modal,
    Heading,
    Alert,
    Tag,
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [],
  },
  {
    path: 'js/new',
    element: <Draff />,
  },
  {
    path: '/:username/:codeFile',
    element: <Draff />,
  },
]);
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(
  process.env.NODE_ENV === 'development' ? console.log : undefined,
);
