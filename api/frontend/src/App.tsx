import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Auth0Provider } from '@auth0/auth0-react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Draff } from './views/Draff';
import { extendBaseTheme, theme as chakraTheme } from '@chakra-ui/react';

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

function App() {
  return (
    <ChakraProvider theme={theme}>
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
  );
}

export default App;
