/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getAllUsers(req, res){
	console.log('hi')
	// TODO: Example here
	return res.json([
		{
			id: 1,
			username: "john",
			password: "123",
		}]
	);
}