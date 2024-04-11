import * as GridDB from './libs/griddb.cjs';
import { generateRandomID } from './libs/rangen.js';

const { collectionDb, store, conInfo } = await GridDB.initGridDbTS();

export async function saveData({ voiceNoteData }) {
	const id = generateRandomID();
	const filename = String(voiceNoteData.filename);
	const speechText = String(voiceNoteData.text);
	const category = String(voiceNoteData.category);

	const packetInfo = [parseInt(id), filename, speechText, category];
	const saveStatus = await GridDB.insert(packetInfo, collectionDb);
	return saveStatus;
}

export async function getDatabyID(id) {
	return await GridDB.queryByID(id, conInfo, store);
}

export async function getAllData() {
	return await GridDB.queryAll(conInfo, store);
}

export async function info() {
	return await GridDB.containersInfo(store);
}
