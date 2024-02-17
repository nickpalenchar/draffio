import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SelectAJam } from './views/SelectAJam';
import { JamLookup } from './views/JamLookup';
import {
  ChakraProvider,
  extendBaseTheme,
  theme as chakraTheme,
} from '@chakra-ui/react';

// Chakra base theme: https://chakra-ui.com/getting-started#chakrabaseprovider
const { Button, Tabs, Input, Container, Card, Modal, Heading, Alert } =
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
  },
});

// ROUTING
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div>
        Home page
      </div>
    ),
  },
]);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <RouterProvider router={router} />
        </header>
      </div>
    </ChakraProvider>
  );
}

export default App;
