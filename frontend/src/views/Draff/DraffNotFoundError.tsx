import {
  Alert,
  AlertDescription,
  AlertDialogFooter,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import React from 'react';
import { FC } from 'react';
import { Button } from '../../ui/Button';

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
      404 - Draff not found!
    </AlertTitle>
    <AlertDescription maxWidth="sm">
      Why not click the button below?
      <br />
      <Button>New Draff</Button>
    </AlertDescription>
  </Alert>
);
