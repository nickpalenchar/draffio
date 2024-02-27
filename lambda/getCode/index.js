const { S3 } = require('aws-sdk')

/** Request body example
 * { path: '/js/tmp/hello-world' }
 * 
 */
exports.handler = async (event) => {
  const client = new S3();

  const { DRAFFIO_CODE_BUCKET } = process.env;

  if (!DRAFFIO_CODE_BUCKET) {
    throw Error('No environment variable DRAFFIO_CODE_BUCKET set.');
  }

  if(!event.path) {
    return { status: 400, message: 'Missing path property'}
  }

  try {
    const res = await client.getObject({
      Key: event.path,
      Bucket: 'draffio-code'
    }).promise();
    if (!res.Body) {
      return { status: 404 };
    }
    const data = res.Body.toString('utf-8');
    return { status: 200, data };
  } catch (e) {
    console.error(e);
    throw e;
  }
}