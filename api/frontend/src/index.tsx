import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import { Draff } from './views/Draff';
import {
  extendBaseTheme,
  theme as chakraTheme,
  ChakraProvider,
} from '@chakra-ui/react';
import { Auth0Provider } from '@auth0/auth0-react';
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
    element: <Draff />,
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

console.log('Auth0 Config:', {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  redirect_uri: window.location.origin
});

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Auth0Provider
        domain={process.env.REACT_APP_AUTH0_DOMAIN || ''}
        clientId={process.env.REACT_APP_AUTH0_CLIENT_ID || ''}
        authorizationParams={{
          redirect_uri: window.location.origin,
          scope: "openid profile email",
          response_type: "code",
          response_mode: "query"
        }}
        onRedirectCallback={(appState) => {
          window.history.replaceState(
            {},
            document.title,
            appState?.returnTo || window.location.pathname
          );
        }}
        cacheLocation="localstorage"
      >
        <RouterProvider router={router} />
      </Auth0Provider>
    </ChakraProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(
  process.env.NODE_ENV === 'development' ? console.log : undefined,
);
