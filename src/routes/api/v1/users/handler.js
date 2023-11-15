import bcrypt from 'bcryptjs';
import { prisma } from '../../../../adapters.js';

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

	const user = await prisma.users.findUnique({
		where: {
			username
		}
	});

	if (!user) {
		console.log("User does not exist.")
		return res.status(401).json({ error: "User does not exist." });
	}

	const auth = await bcrypt.compare(password, user.password);
	if (auth) {
		console.log("User login.")
		return res.status(200).send(); //TODO
	} else {
		console.log("Password incorrect.")
		return res.status(401).json({ error : "Password incorrect."});
	}
}

export async function registerHandler(req, res) {

	const { username, password } = req.body;

	const salt = await bcrypt.genSalt(10);
	const user = await prisma.users.findUnique({
		where: {
			username
		}
	});

	if (user) {
		console.log("User already register")
		return res.status(401).json({ error: "Username already registered." })
	}

	const dummy = await prisma.users.create({
		data: {
			username: username,
			password: await bcrypt.hash(password, salt),
			permission: 0	// TODO
		},
	})
	console.log("User register.")
	return res.status(201).send();
}