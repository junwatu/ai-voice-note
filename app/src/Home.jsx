import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

export default function Home() {

	const recorderControls = useAudioRecorder(
		{
			noiseSuppression: true,
			echoCancellation: true,
		},
		(err) => console.table(err) // onNotAllowedOrFound
	);
	const addAudioElement = (blob) => {
		const url = URL.createObjectURL(blob);
		const audio = document.createElement('audio');
		audio.src = url;
		audio.controls = true;
		document.body.appendChild(audio);

		const formData = new FormData();
		formData.append("file", blob, "audio.webm");

		fetch('http://localhost:3000/upload', {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				console.log('Success:', data);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	};

	return (
		<div className="hero min-h-screen bg-base-200">
			<div className="hero-content text-center">
				<div className="max-w-md">
					<h1 className="text-5xl font-bold">Audio Note</h1>
					<div className='flex justify-center items-center w-full my-32'>
						<AudioRecorder
							onRecordingComplete={(blob) => addAudioElement(blob)}
							recorderControls={recorderControls}
							showVisualizer={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}