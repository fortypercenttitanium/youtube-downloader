import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import './App.css';
import knightLogo from './knight_logo.png';

const useStyles = makeStyles((theme) => ({
	textField: {
		margin: 'auto 2rem',
		width: '60ch',
	},
	header: {
		display: 'flex',
		justifyContent: 'center',
		margin: 'auto',
	},
	headerText: { margin: 'auto 1rem' },
	headerImg: { height: '10rem', margin: 'auto 0 auto 2.5rem' },
	paper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '3rem',
	},
	button: {
		margin: '2rem auto',
	},
}));

function App() {
	const classes = useStyles();

	const [urlBox, setUrlBox] = useState('');
	const [errors, setErrors] = useState([]);
	const [isButtonDisabled, setIsButtonDisabled] = useState(true);

	const handleChange = (e) => {
		setUrlBox(e.target.value);
	};

	async function checkUrl() {
		if (urlBox) {
			setErrors([]);
			const myHeaders = new Headers();
			myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

			const urlencoded = new URLSearchParams();
			urlencoded.append('url', urlBox);

			const requestOptions = {
				method: 'POST',
				headers: myHeaders,
				body: urlencoded,
				redirect: 'follow',
			};

			try {
				const result = await fetch(`/`, requestOptions);
				if (result.status !== 200) {
					setErrors([`${result.status} - ${result.statusText}`]);
					setIsButtonDisabled(true);
				} else {
					setIsButtonDisabled(false);
				}
			} catch (err) {
				setErrors([err.message]);
			}
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
	};

	const hiddenForm = useRef();

	const handleClick = () => {
		hiddenForm.current.submit();
		setUrlBox('');
	};

	return (
		<div className='App'>
			<header className={classes.header}>
				<h1 className={classes.headerText}>Youtube</h1>
				<img className={classes.headerImg} src={knightLogo} alt='knight logo' />
				<h1 className={classes.headerText}>Downloader</h1>
			</header>

			<form className='form' onSubmit={handleSubmit}>
				<Paper className={classes.paper}>
					<TextField
						id='outlined-basic'
						label='Enter URL'
						helperText='e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ'
						variant='outlined'
						className={classes.textField}
						type='text'
						name='url'
						value={urlBox}
						onChange={handleChange}
						onBlur={checkUrl}
						required
					/>
					<Button
						className={classes.button}
						size='large'
						type='button'
						variant='contained'
						color='primary'
						onClick={handleClick}
						disabled={isButtonDisabled}
					>
						Download
					</Button>
					{errors &&
						errors.map((err) => {
							return <p key={err}>Error: {err}</p>;
						})}
				</Paper>
			</form>
			<form
				ref={hiddenForm}
				className='hidden-form'
				action='/file-download'
				onChange={() => {}}
				method='POST'
			>
				<input name='url' value={urlBox} />
			</form>
		</div>
	);
}

export default App;
