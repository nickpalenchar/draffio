import React from 'react';
import { ChakraProvider, Container } from '@chakra-ui/react';

function App() {
  window.location.href = '/js/new';
  return (
    <ChakraProvider>
      <div className="App"></div>
    </ChakraProvider>
  );
}

export default App;
