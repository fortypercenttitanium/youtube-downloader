import React, { useState, useRef } from 'react';
import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import './App.css';
import knightLogo from './knight_logo.png';

const theme = createMuiTheme({
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 720,
			lg: 1280,
			xl: 1920,
		},
	},
});

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
	headerText: { margin: 'auto 0 2.5rem' },
	headerImg: { height: '10rem', margin: 'auto 0' },
	paper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '3rem 2rem 1rem',
		marginTop: '2rem',
	},
	button: {
		margin: '2rem auto',
	},
	[theme.breakpoints.down('sm')]: {
		textField: {
			width: '45ch',
		},
	},
	[theme.breakpoints.down('xs')]: {
		paper: {
			padding: '3rem 0 0',
		},
		textField: {
			width: '15rem',
		},
		headerText: { margin: 'auto 0 2rem', fontSize: '1.2rem' },
		headerImg: { height: '6rem', margin: 'auto 0' },
	},
}));

function App() {
	const classes = useStyles(theme);

	const [urlBox, setUrlBox] = useState('');
	const [errors, setErrors] = useState([]);
	const [isButtonDisabled, setIsButtonDisabled] = useState(true);

	const handleChange = (e) => {
		setUrlBox(e.target.value);
	};

	const checkUrl = () => {
		if (urlBox) {
			if (
				urlBox.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)
			) {
				setErrors([]);
				setIsButtonDisabled(false);
			} else {
				setErrors(['Invalid url']);
				setIsButtonDisabled(true);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
	};

	const hiddenForm = useRef();

	const handleClick = async () => {
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
					hiddenForm.current.submit();
					setUrlBox('');
				}
			} catch (err) {
				setErrors([err.message]);
			}
		}
	};

	return (
		<div className='App'>
			<header className={classes.header}>
				<img className={classes.headerImg} src={knightLogo} alt='knight logo' />
				<h1 className={classes.headerText}>Youtube Downloader</h1>
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
				readOnly
				method='POST'
			>
				<input readOnly name='url' value={urlBox} />
			</form>
		</div>
	);
}

export default App;
