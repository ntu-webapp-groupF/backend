import bcrypt from 'bcryptjs';
import { prisma } from '../../../../adapters.js';

function exclude(obj, keys) {
    for (let key of keys) {
      delete obj[key]
    }
    return obj
}
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getAllUsers(req, res) {
	const users = await prisma.users.findMany();
	console.log(users);
	return res.status(200).send(users);
}

export async function loginHandler(req, res) {

	const { username, password } = req.body;

	if ( !username || !password ) {
		return res.status(400).json({ error: "Bad request field."})
	}

	if (req.session.user) {
		return res.status(400).json( { error: "User already login."})
	}

	const user = await prisma.users.findUnique({
		where: {
			username
		}
	});

	if (!user) {
		console.log("User does not exist.")
		return res.status(404).json({ error: "User does not exist." });
	}

	const auth = await bcrypt.compare(password, user.password);
	if (auth) {
		console.log("User login.")
		req.session.user = user;
		return res.status(200).send(exclude(user,['password']));
	} else {
		console.log("Password incorrect.")
		return res.status(401).json({ error : "Password incorrect."});
	}
}

export async function registerHandler(req, res) {

	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: "Bad Request field." })
	} 

	if (username.length > 20 || password.length < 6 || password.length > 20) {
		return res.status(400).json({ error: "Illegal username or password."})
	}

	const salt = await bcrypt.genSalt(10);
	const user = await prisma.users.findUnique({
		where: {
			username
		}
	});

	if (user) {
		console.log("User already register")
		return res.status(400).json({ error: "Username already registered." })
	}

	const new_user = await prisma.users.create({
		data: {
			username: username,
			password: await bcrypt.hash(password, salt),
			permission: 1,
		},
	})

	if (!new_user) {
		return res.status(500).json({ error: "Internal Server Error."})
	}

	return res.status(200).send(exclude(new_user, ['password']));
}