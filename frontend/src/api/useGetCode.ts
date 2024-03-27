import { useEffect, useState } from 'react';

interface UseGetCadeParams {
  username: string;
  codeFile: string;
}

export const useGetCode: ({ username, codeFile }: UseGetCadeParams) => {
  code: string;
  error: string;
  loading: boolean;
} = ({ username, codeFile }) => {
  const [code, setCode] = useState(' ');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username !== 'dev/null') {
      fetch(`${process.env.REACT_APP_API_GW}/code/${username}/${codeFile}`).then(
        async (res: any) => {
          if (res.status !== 200) {
            console.error('error', { res });
            return setError(res.body ?? 'An error occurred');
          }
          const data = await res.json();
          const code = data.text;
          if (!code) {
            setLoading(false);
            return setError('Problem with fetching the Draff');
          }
          await new Promise(res => setTimeout(res, 3000));
          setCode(code);
          setLoading(false);
        },
      );
    }
  }, [username, codeFile]);

  if (loading) {
    return {code: '          ', error: '', loading: true}; 
  }

  if (username === 'dev/null') {
    return { code, error: '', loading: false };
  }
  // return {code: '', error: '', loading: true}
  return { code, error, loading: false };
};
