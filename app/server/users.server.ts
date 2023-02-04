import { z } from 'zod';
import { prisma } from './db.server';

export const addUserSchema = z.object({
	name: z.string(),
	email: z.string().email({
		message: "Votre email n'est pas valide",
	}),
});

export type EditUser = z.infer<typeof addUserSchema>;

export const getUsers = async () => {
	const users = await prisma.user.findMany({});
	return users;
};

export const addUser = async ({
	email,
	name,
}: {
	email: string;
	name: string;
}) => {
	await new Promise((resolve) => setTimeout(resolve, 2500));
	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser) {
		throw Error('Cet email est déjà utilisé.');
	}
	//
	const newUser = await prisma.user.create({
		data: {
			email,
			name,
		},
	});
	return newUser;
};

export const getUser = async (userId: number) => {
	return await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});
};

export const editUser = async ({
	data,
	userId,
}: {
	userId: string;
	data: EditUser;
}) => {
	return await prisma.user.update({
		where: {
			id: parseInt(userId),
		},
		data,
	});
};

export const deleteUser = async ({ userId }: { userId: string }) => {
	await new Promise((resolve) => setTimeout(resolve, 2500));
	return await prisma.user.delete({
		where: {
			id: parseInt(userId),
		},
	});
};
