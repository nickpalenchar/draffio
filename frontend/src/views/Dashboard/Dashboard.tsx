import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';
import { DeleteIcon } from '@chakra-ui/icons';

interface Draff {
  title: string;
  language: string;
  updatedAt: string;
  author: string;
}

export const Dashboard = () => {
  const { user, isAuthenticated, logout, getAccessTokenSilently } = useAuth0();
  const [draffs, setDraffs] = useState<Draff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draffToDelete, setDraffToDelete] = useState<Draff | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchDraffs = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await apiClient.get('/v1/draffs/user/self', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDraffs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch draffs:', err);
        setError('Failed to load draffs');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDraffs();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleDelete = async () => {
    if (!draffToDelete) return;

    try {
      const token = await getAccessTokenSilently();
      await apiClient.delete(`/v1/draffs/@${draffToDelete.author}/${draffToDelete.title}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDraffs(draffs.filter(d => d.title !== draffToDelete.title));
      toast({
        title: 'Draff deleted',
        description: `Successfully deleted "${draffToDelete.title}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
        variant: 'subtle',
        containerStyle: {
          background: 'yellow.50',
        },
      });
    } catch (err) {
      console.error('Failed to delete draff:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete draff',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
        variant: 'subtle',
        containerStyle: {
          background: 'yellow.50',
        },
      });
    } finally {
      setDraffToDelete(null);
    }
  };

  return (
    <Box minHeight="100vh" bgColor="yellow.50">
      {/* Nav Bar */}
      <Flex
        bgColor="orange.200"
        borderBottomColor="orange.300"
        borderBottomWidth="1px"
        height="4em"
        justifyContent="space-between"
        alignItems="center"
        px={4}
      >
        <Flex alignItems="center" gap={4}>
          <Link as={RouterLink} to="/">
            <Image
              src={process.env.PUBLIC_URL + '/draff-logo.webp'}
              height="2.8em"
              marginTop={2}
            />
          </Link>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="orange.600"
          >
            Dashboard
          </Text>
        </Flex>

        <Menu>
          <MenuButton>
            <Avatar
              src={user?.picture}
              size="sm"
              cursor="pointer"
              borderRadius="full"
              border="2px solid"
              borderColor="orange.300"
              width="32px"
              height="32px"
            />
          </MenuButton>
          <MenuList
            bg="yellow.50"
            borderColor="orange.300"
            boxShadow="md"
            zIndex={2}
          >
            <MenuItem
              py={3}
              px={4}
              _hover={{ bg: 'yellow.100' }}
            >
              <Box>
                <Text fontWeight="bold" color="orange.600">
                  {user?.email}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {user?.name || 'Anonymous Giraffe'}
                </Text>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={() => logout({ 
                logoutParams: {
                  returnTo: window.location.origin
                }
              })}
              py={2}
              px={4}
              _hover={{ bg: 'yellow.100' }}
              color="orange.600"
            >
              Log Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Content */}
      <Box p={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="orange.600">
            Your Draffs
          </Text>
          <Link as={RouterLink} to="/js/new">
            <Button
              bgColor="orange.600"
              color="white"
              _hover={{ bgColor: 'orange.700' }}
              size="sm"
              borderRadius="0"
              h="32px"
              fontSize="14px"
            >
              New Draff
            </Button>
          </Link>
        </Flex>

        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner color="orange.600" size="xl" />
          </Flex>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : draffs.length === 0 ? (
          <Text color="gray.600">No draffs yet. Create your first one!</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="orange.600" width={{ base: "auto", md: "300px" }} pl={4}>
                  Title
                </Th>
                <Th color="orange.600" px={6}>
                  Language
                </Th>
                <Th color="orange.600" px={6}>
                  Last Updated
                </Th>
                <Th width="50px"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {draffs.map((draff) => (
                <Tr key={draff.title} _hover={{ bgColor: 'yellow.100' }}>
                  <Td pl={4}>
                    <Link
                      as={RouterLink}
                      to={`/d/@${draff.author}/${draff.title}`}
                      color="orange.600"
                      fontWeight="medium"
                      _hover={{ textDecoration: 'underline' }}
                      display="block"
                      minWidth={{ base: "auto", md: '160px' }}
                    >
                      {draff.title}
                    </Link>
                  </Td>
                  <Td px={6}>{draff.language}</Td>
                  <Td px={6}>{new Date(draff.updatedAt).toLocaleDateString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setDraffToDelete(draff)}
                    >
                      <DeleteIcon />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <AlertDialog
        isOpen={draffToDelete !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setDraffToDelete(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="yellow.50">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="orange.600">
              Delete Draff
            </AlertDialogHeader>

            <AlertDialogBody color="gray.700">
              Are you sure you want to delete "{draffToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDraffToDelete(null)}
                variant="ghost"
                color="gray.600"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                borderRadius="0"
                h="32px"
                fontSize="14px"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}; 