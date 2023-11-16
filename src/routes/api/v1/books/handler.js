/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function testUpload(req, res) {
    console.log(req.files)
    console.log(req.body)
    //console.log(req.body[key])
	return res.status(200).json({'message': 'OK'})
}