export const handler = async (event) => {
  try {
      const allowedOrigins = [process.env.ORIGIN, 'http://localhost:3000'];
      if (allowedOrigins.includes(event?.headers?.origin)) {
          return generatePolicy('user', 'Allow', event.methodArn);
      }
      return generatePolicy('user', 'Deny', event.methodArn);
  } catch (error) {
      console.error('Error:', error);
      return generatePolicy('user', 'Deny', event.methodArn);
    }
  };
  const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {
        "principalId": principalId,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "execute-api:Invoke",
                "Effect": effect,
                "Resource": resource
            }]
        }
    };
    return authResponse;
  };