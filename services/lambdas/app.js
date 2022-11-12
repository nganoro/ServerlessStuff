exports.handler = async function (event, context) {
    console.log(event);
    console.log('hi');
    return {
        statusCode: 200,
        body: 'Hello from Lambda!'
    }
}
