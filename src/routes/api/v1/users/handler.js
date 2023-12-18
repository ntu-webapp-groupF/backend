import bcrypt from 'bcryptjs';
import { prisma, redisClient } from '../../../../adapters.js';


function exclude(obj, keys) {
	for (let key of keys) {
		delete obj[key];
	}
	return obj;
}
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getCurrentUser(req, res) {

	if (!req.session.user) {
		return res.status(401).json({ error: "Please login first" });
	}

	try{
		const user = await prisma.users.findUnique({
			where: {
				id: req.session.user.id,
			}
		});

		if (!user) {
			return res.status(500).json({ error: "Internal server error." });
		}

		req.session.user = user;
		const val = exclude(user, ['password']);
		return res.status(200).json(val);
	} catch (e) {
		console.log(e);
		return res.status(500).json({ error: e });
	}

}

export async function loginHandler(req, res) {

	const { username, password } = req.body;

	if (req.session.user) {
		return res.status(400).json({ error: "User already logged in." });
	}

	if (!username || !password) {
		return res.status(400).json({ error: "Bad request field." });
	}

	try {
		const user = await prisma.users.findUnique({
			where: {
				username: username
			}
		});


		if (!user) {
			return res.status(404).json({ error: "Wrong username or password." });
		}

		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			req.session.user = user;
			const val = exclude(user, ['password']);
			await redisClient.set(user.username, JSON.stringify(val));

			return res.status(200).send(val);
		} else {
			return res.status(401).json({ error: "Wrong username or password" });
		}
	} catch (e) {
		console.log(e);
		return res.status(500).json({ error: e })
	}


}

export async function registerHandler(req, res) {

	const { username, password } = req.body;

	if (req.session.user) {
		return res.status(400).json({ error: "User already logged in." });
	}

	if (!username || !password) {
		return res.status(400).json({ error: "Bad Request field." });
	}

	if (username.length > 20 || password.length < 6 || password.length > 20) {
		return res.status(400).json({ error: "Illegal username or password." });
	}

	try {
		const salt = await bcrypt.genSalt(10);
		const cache = await redisClient.get(username);

		let user;

		if (cache) {
			return res.status(400).json({ error: "Username already registered." });
		} else {
			user = await prisma.users.findUnique({
				where: {
					username: username
				}
			});
		}

		if (user) {
			return res.status(400).json({ error: "Username already registered." });
		}

		const new_user = await prisma.users.create({
			data: {
				username: username,
				password: await bcrypt.hash(password, salt),
				permission: 1,
			},
		});

		if (!new_user) {
			return res.status(500).json({ error: "Internal Server Error." });
		}

		const val = exclude(new_user, ['password']);
		await redisClient.set(new_user.username, JSON.stringify(val));
		return res.status(200).send(val);

	} catch (e) {
		return res.status(200).json({ error: e });
	}
}

export async function updateHandler(req, res) {

	if (!req.session.user) {
		return res.status(401).json({ error: "Please login first." });
	}

	if (!req.body.username || req.body.username.length > 20) {
		return res.status(400).json({ error: "Illegal username or password." });
	}

	try {

		const cache = await redisClient.get(req.body.username);
		if (cache) {
			await redisClient.del(req.body.username);
		}

		if (req.body.old_password && req.body.new_password) {
			if (req.body.new_password.length < 6 || req.body.new_password.length > 20 ||
				req.body.old_password === req.body.new_password) {
				return res.status(400).json({ error: "Illegal password update operation." });
			}

			const user = await prisma.users.findUnique({
				where: {
					id: req.session.user.id,
				}
			});

			if (!user) {
				return res.status(500).json({ error: "Internal server error." });
			}

			const auth = await bcrypt.compare(req.body.old_password, user.password);
			if (auth) {
				const salt = await bcrypt.genSalt(10);
				const updated = await prisma.users.update({
					where: {
						id: req.session.user.id,
					},
					data: {
						username: req.body.username,
						password: await bcrypt.hash(req.body.new_password, salt),
					},
				});

				if (!updated) {
					return res.status(500).json({ error: "Internal server error." });
				}
				return res.status(200).send(exclude(updated, ['password']));
			} else {
				return res.status(401).json({error:"Wrong user password."})
			}
		} else {
			const updated = await prisma.users.update({
				where: {
					id: req.session.user.id,
				},
				data: {
					username: req.body.username,
				},
			});
			if (!updated) {
				return res.status(500).json({ error: "Internal server error." });
			}
			return res.status(200).send(exclude(updated, ['password']));
		}
	} catch (e) {
		return res.status(400).json({ error: e });
	}
}

export async function addMember(req, res) {

	if (!req.session.user) {
		return res.status(404).json({ error: "Page not found." });
	}

	const user = await prisma.users.findUnique({
		where: {
			id: req.session.user.id,
		}
	});

	if (!user) {
		return res.status(404).json({ error: "Page not found." });
	}

	const userid = parseInt(req.params.id);

	/*
	if (userid !== req.session.user.id) {
		return res.status(400).json({ error: "Operation failed." });
	}
	*/

	try {
		const member = await prisma.users.update({
			where: {
				id: userid,
			},
			data: {
				permission: 2,
			},
		});

		if (!member) {
			return res.status(500).json({ error: "Internal server error." });
		}
		return res.status(200).send(exclude(member, ['password']));
	} catch (e) {
		return res.status(404).json({ error: e });
	}
}

export async function logoutHandler(req, res) {

	if (!req.session.user) {
		return res.status(401).json({ error: "User is not logged in." })
	}

	req.session.user = null;
	req.session.destroy();

	return res.status(200).send();
}