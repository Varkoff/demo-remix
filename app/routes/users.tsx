import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Form,
	Link,
	Outlet,
	useActionData,
	useFetcher,
	useLoaderData,
} from '@remix-run/react';
import { z } from 'zod';
import { addUser, deleteUser, getUsers } from '~/server/users.server';

type UserType = Awaited<ReturnType<typeof getUsers>>[number];

export const loader = async ({}: LoaderArgs) => {
	const users = await getUsers();
	return json({ users });
};

export const deleteUserSchema = z.object({
	userId: z.string(),
});

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();
	const data = Object.fromEntries(formData);
	// ! Je sais que ma donnée est conforme
	const userData = deleteUserSchema.parse(data);
	await deleteUser({ userId: userData.userId });
	return json({});
};

export const UserPage = () => {
	const { users } = useLoaderData<typeof loader>();
	return (
		<main className='px-12 py-8'>
			<Outlet />
			<Link
				to='/users/new'
				className='bg-emerald-600 text-white rounded-sm px-3 py-2 hover:text-white hover:bg-emerald-600'
			>
				Ajouter un utilisateur
			</Link>

			<table>
				<thead>
					<tr>
						<th className='text-left whitespace-nowrap font-bold font-sans px-4 py-3'>
							Nom
						</th>
						<th className='text-left whitespace-nowrap font-bold font-sans px-4 py-3'>
							Email
						</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<UserItems key={user.id} user={user} />
					))}
				</tbody>
			</table>
		</main>
	);
};

export const UserItems = ({ user }: { user: UserType }) => {
	const fetcher = useFetcher();
	const isLoading = fetcher.state === 'submitting';
	return (
		<tr
			className={`${
				isLoading ? 'opacity-50' : ''
			} border-b border-slate-50 last:border-none`}
			key={user.id}
		>
			<td className='text-left whitespace-nowrap font-sans px-4 py-3'>
				<Link to={`/users/${user.id}`} className='text-sky-600 underline'>
					{' '}
					{user.name}
				</Link>
			</td>
			<td className='text-left whitespace-nowrap font-sans px-4 py-3'>
				{user.email}
			</td>
			<td>
				{!isLoading ? (
					<fetcher.Form method='post'>
						<button
							name='userId'
							value={user.id}
							className='text-xs text-slate-500'
							type='submit'
						>
							Supprimer
						</button>
					</fetcher.Form>
				) : null}
			</td>
		</tr>
	);
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
	return (
		<div>
			Oops ! Une erreur est survenue. <p>{error.message}</p>
		</div>
	);
};
export default UserPage;
