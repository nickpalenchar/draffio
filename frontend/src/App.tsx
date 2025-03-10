import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Auth0Provider } from '@auth0/auth0-react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { Draff } from './views/Draff';
import { Profile } from './views/Profile/Profile';
import { extendBaseTheme, theme as chakraTheme } from '@chakra-ui/react';
import { Auth0CallbackHandler } from './components/Auth0CallbackHandler';
import { Dashboard } from './views/Dashboard/Dashboard';

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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/js/new" replace />,
  },
  {
    path: 'js/new',
    element: <Draff />,
  },
  {
    path: 'd/:username/:title',
    element: <Draff />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/callback',
    element: <Auth0CallbackHandler />,
  },
  {
    path: '/profile',
    element: <Profile />,
  }
]);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Auth0Provider
        domain={process.env.REACT_APP_AUTH0_DOMAIN || ''}
        clientId={process.env.REACT_APP_AUTH0_CLIENT_ID || ''}
        authorizationParams={{
          redirect_uri: window.location.origin + '/callback',
          scope: "openid profile email",
          response_type: "code",
          response_mode: "query",
          audience: "draffio"
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
  );
}

export default App;
