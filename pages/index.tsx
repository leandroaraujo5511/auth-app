import { Button, Flex, Input, Stack } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import {parseCookies} from 'nookies'
import { withSSRGuest } from '../ultils/withSSRGuest';

export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {singIn} = useContext(AuthContext)


  async function handlerSubmit(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password,
    }

    await singIn(data);
  }


  return (
    <Flex
      w="100vw"
      h="100vh"
      align="center"
      bg="gray.900"
      justify="center"
    >
      <Flex
        as="form"
        width="100%"
        maxWidth={360}
        flexDirection="column"
        onSubmit={handlerSubmit}
        bg="gray.800"
        p="8"
        borderRadius={8}       
        >
          <Stack spacing={4}>
            <Input 
              bgColor="gray.300"
              size="lg"
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <Input 
              bgColor="gray.300"
              size="lg"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)} />

          </Stack>
          <Button mt="6" bg="purple.800" color="gray.50" type="submit">Entrar</Button>
        

      </Flex>

    </Flex>

  )
}


export const getServerSideProps = withSSRGuest(async (ctx) => {  
  return {
    props: {
      
    }
  }
});

