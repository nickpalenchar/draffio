import { useEffect, useState } from 'react';

interface UseGetCadeParams {
  username: string;
  codeFile: string;
}

export const useGetCode: ({ username, codeFile }: UseGetCadeParams) => {
  code: string;
  error: string;
} = ({ username, codeFile }) => {
  const [code, setCode] = useState('// Your code here...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (username !== 'dev/null') {
      fetch(`${process.env.REACT_APP_API_GW}/code/${username}/${codeFile}`).then(
        async (res: any) => {
          if (res.status !== 200) {
            console.error('error', { res });
            return setError(res.body ?? 'An error occured');
          }
          const data = await res.json();
          console.log({ res: data });
          const code = data.text;
          if (!code) {
            return setError('Problem with fetching the Draff');
          }
          setCode(code);
        },
      );
    }
  }, [username, codeFile]);

  if (username === 'dev/null') {
    return { code, error: '' };
  }

  return { code, error };
};
