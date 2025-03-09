import {
  Alert,
  AlertDescription,
  AlertDialogFooter,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { FC } from 'react';
import { Button } from '../../ui/Button';
import { IoLeaf } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

export const DraffNotFoundError: FC = () => {
  const navigate = useNavigate();

  const onClick = useCallback(() => (window.location.href = '/js/new'), []);

  return (
    <Alert
      status="warning"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="404px"
      backgroundColor="yellow.100"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Draff not found!
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        Why not click the button below?
        <br />
        <br />
        <Button colorScheme="teal" rightIcon={<IoLeaf />} onClick={onClick}>
          New Draff
        </Button>
      </AlertDescription>
    </Alert>
  );
};
