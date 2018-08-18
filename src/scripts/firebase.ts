import firebase from 'firebase/app'
import 'firebase/firestore'

const config = {
	apiKey: ' AIzaSyCoqGBcuMqyZ_2tMLn7ad9ZQUblw7C_QLY',
	projectId: 'thesaurusify',
}
firebase.initializeApp(config)
export default firebase
