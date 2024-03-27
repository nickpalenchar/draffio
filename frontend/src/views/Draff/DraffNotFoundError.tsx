import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import React from 'react';
import { FC } from 'react';

export const DraffNotFoundError: FC = () => (
  <Alert
    status="warning"
    variant="subtle"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    height="404px"
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">
      404
    </AlertTitle>
    <AlertDescription maxWidth="sm">Draff not found!</AlertDescription>
  </Alert>
);
