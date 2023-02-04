import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Form,
	useActionData,
	useLoaderData,
	useParams,
	useTransition,
} from '@remix-run/react';
import { z } from 'zod';
import {
	addUser,
	addUserSchema,
	editUser,
	getUser,
} from '~/server/users.server';

export const loader = async ({ params }: LoaderArgs) => {
	const userId = z.string().parse(params.userId);

	const isNew = userId === 'new';
	if (isNew) {
		return json({ user: { name: '', email: '', id: '' } });
	}
	const user = await getUser(parseInt(userId));
	return json({ user });
};

export const action = async ({ request, params }: ActionArgs) => {
	// Est exécutée dès qu'un formulaire est envoyé en post sur cette route

	const formData = await request.formData();
	const data = Object.fromEntries(formData);
	// ! Je sais que ma donnée est conforme
	const userData = addUserSchema.parse(data);
	const userId = z.string().parse(params.userId);

	const isNew = userId === 'new';
	try {
		if (isNew) {
			await addUser(userData);
			return json({ message: "L'utilisateur a été ajouté", error: false });
		} else {
			await editUser({ userId, data: userData });
			return json({ message: "L'utilisateur a été modifié", error: false });
		}
	} catch (err) {
		return json({ message: 'Cet email est déjà utilisé', error: true });
	}
};

export const UserDetailPage = () => {
	const actionData = useActionData<typeof action>();
	const { user } = useLoaderData<typeof loader>();
	const transition = useTransition();
	const isLoading = transition.state === 'submitting';

	const params = useParams();
	const isNew = params.userId === 'new';

	return (
		<fieldset disabled={isLoading} className='py-8' key={user?.id}>
			<Form method='post' className='flex flex-col gap-4 items-start'>
				<input
					type='text'
					className='border bg-slate-200 px-3 py-2 rounded-sm'
					required
					defaultValue={user?.name}
					name='name'
					placeholder='Entrez votre nom'
				/>
				<input
					type='email'
					className='border bg-slate-200 px-3 py-2 rounded-sm'
					required
					name='email'
					defaultValue={user?.email}
					placeholder='Entrez votre email'
				/>
				{actionData?.message ? (
					<div
						role='alert'
						className={`${
							actionData.error ? 'text-red-600' : 'text-green-400'
						}`}
					>
						{actionData.message}
					</div>
				) : null}
				<button
					type='submit'
					className='disabled:opacity-30 bg-black text-white rounded-sm px-3 py-2 hover:text-white hover:bg-black'
				>
					{isLoading
						? 'Sauvegarde en cours ...'
						: isNew
						? 'Ajouter'
						: 'Sauvegarder'}
				</button>
			</Form>
		</fieldset>
	);
};

export default UserDetailPage;
